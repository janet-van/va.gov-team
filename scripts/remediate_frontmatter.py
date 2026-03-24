#!/usr/bin/env python3
"""
Automated frontmatter remediation script for research plans and conversation guides.

This script helps fix files identified in the frontmatter audit by:
1. Adding frontmatter templates to files with none
2. Replacing placeholder data with smart-extracted information from content and paths
3. Extracting team, product, date, and methodology information automatically

Usage:
  # Add frontmatter to a single file without any
  python3 remediate_frontmatter.py --mode add-template --file <path> --file-type research_plan
  
  # Process all files with no frontmatter from CSV audit
  python3 remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status no_frontmatter
  
  # Replace placeholders in files with placeholder data
  python3 remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status has_placeholder
  
  # Dry run to see what would be changed
  python3 remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status has_placeholder --dry-run
  
  # Process only first 10 files
  python3 remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status has_placeholder --limit 10

Features:
  - Automatically extracts team/product names from file paths
  - Detects dates from filenames (e.g., 2024-01 -> 2024-01-01)
  - Auto-detects research methodology from content
  - Skips template files and platform/ directory
  - Provides detailed progress reporting
"""

import os
import re
import sys
import csv
import argparse
from datetime import datetime
from pathlib import Path

# Frontmatter templates
RESEARCH_PLAN_TEMPLATE = '''---
# Research Plan Metadata
title: "Research Plan for {team}, {product}, {date}"
date: {date}
last_updated: {date}
team: "{team}"
product: "{product}"
product_area: "authenticated"

# Background Context
background:
  problem_statement: "TBD - Please complete from research plan content"
  product_location: "TBD - Please specify location on VA.gov"
  user_familiarity: "TBD - New product or iteration?"
  product_brief_url: "TBD - Add product brief URL if available"

# Research Design
methodology: "TBD - e.g., usability testing, semi-structured interviews"
research_format: 
  location: remote
  moderated: true
  
# Research Goals & Questions
research_goals:
  - goal_1: "TBD - Extract from research plan"
  - goal_2: "TBD - Extract from research plan"

research_questions:
  - "TBD - Extract from research plan"

hypotheses:
  - "TBD - Extract from research plan if available"

expected_outcomes: "TBD - How will findings advance the product?"

# Recruitment & Participants
recruitment:
  recruiting_partner: "Perigean"
  approach: "TBD"
  
participants:
  veterans: 0
  caregivers: 0
  dependents: 0
  total_recruited: 0
  completed_sessions_goal: 0
  
# Timeline & Sessions
timeline:
  pilot_date: "TBD"
  research_dates: "TBD"
  
session_details:
  duration_minutes: 60
  buffer_minutes: 30
  max_sessions_per_day: 0
  
# Strategic Alignment
octo_priorities:
  - objective: "TBD"

veteran_journey_phases:
  - "TBD"
    
# Research Repository Tracking
tags:
  - "TBD"
---

'''

CONVERSATION_GUIDE_TEMPLATE = '''---
title: "Conversation Guide for {team}, {product}, {date}"
author: "TBD"
date_created: "{date}"
last_modified: "{date}"

# Core research metadata
team: "{team}"
portfolio: "TBD"
product: "{product}"
research_phase: "TBD"
research_method: "moderated_interview"

# Session details
session_duration: "60 minutes"
session_type: "remote_moderated"
participant_criteria: "TBD"

# Related documents
related_research_plan: "TBD"
related_prototype: "N/A"

tags:
  - "TBD"
description: "TBD"

# Compliance flags
recording_required: true
observer_support: true
consent_for_clips: true
---

'''

def extract_team_and_product_from_path(file_path):
    """Extract team and product information from file path."""
    parts = Path(file_path).parts
    
    # Common patterns
    if 'products' in parts:
        idx = parts.index('products')
        if len(parts) > idx + 1:
            product = parts[idx + 1]
            team = product  # Default team to product name
            return team, product
    
    if 'teams' in parts:
        idx = parts.index('teams')
        if len(parts) > idx + 1:
            team = parts[idx + 1]
            # Try to find product
            if len(parts) > idx + 2:
                product = parts[idx + 2]
            else:
                product = team
            return team, product
    
    # Fallback: use directory name
    parent = Path(file_path).parent.name
    return parent, parent

def clean_text_for_yaml(text):
    """Clean and format text for YAML frontmatter."""
    # Remove excessive whitespace and newlines
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove markdown links but keep the text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Limit length
    if len(text) > 500:
        text = text[:497] + '...'
    return text

def extract_section_content(content, header_pattern):
    """Extract content from a markdown section by header pattern."""
    match = re.search(header_pattern, content, re.DOTALL | re.IGNORECASE)
    if match:
        section_text = match.group(1).strip()
        return section_text
    return None

def extract_list_items(text, max_items=5):
    """Extract bullet point items from text."""
    # Try bullet points first
    items = re.findall(r'(?:^|\n)[\s]*[-*+]\s*(.+?)(?=\n[\s]*[-*+]|\n\n|\Z)', text, re.DOTALL)
    if items:
        return [clean_text_for_yaml(item.strip()) for item in items[:max_items]]
    
    # Try numbered lists
    items = re.findall(r'(?:^|\n)[\s]*\d+\.\s*(.+?)(?=\n[\s]*\d+\.|\n\n|\Z)', text, re.DOTALL)
    if items:
        return [clean_text_for_yaml(item.strip()) for item in items[:max_items]]
    
    return []

def extract_paragraph(text):
    """Extract first substantial paragraph from text."""
    # Remove bullet points and numbered lists
    clean = re.sub(r'(?:^|\n)[\s]*[-*+]\s*.+', '', text)
    clean = re.sub(r'(?:^|\n)[\s]*\d+\.\s*.+', '', clean)
    
    # Get first paragraph
    paragraphs = [p.strip() for p in clean.split('\n\n') if p.strip()]
    if paragraphs:
        return clean_text_for_yaml(paragraphs[0])
    return None

def extract_info_from_content(content, file_type):
    """Extract useful information from file content using NLP and section parsing."""
    info = {
        'has_goals': False,
        'has_questions': False,
        'has_hypotheses': False,
        'has_background': False,
        'has_recruitment': False,
        'goals': [],
        'questions': [],
        'hypotheses': [],
        'background': None,
        'problem_statement': None,
        'methodology': 'TBD',
        'recruitment_approach': None,
        'primary_criteria': [],
        'expected_outcomes': None,
    }
    
    # Extract Background/Problem Statement (try ## and ### headers)
    background_match = extract_section_content(content, r'##\s+\*?\*?Background\*?\*?\s*\n(.*?)(?=\n##|\Z)')
    if background_match:
        info['has_background'] = True
        info['background'] = extract_paragraph(background_match)
        info['problem_statement'] = info['background']  # Use same text for problem statement
    
    # Extract Research Goals (try ## and ### headers)
    goals_match = extract_section_content(content, r'##\s+\*?\*?(?:Research\s+)?Goals?\*?\*?\s*\n(.*?)(?=\n##|\Z)')
    if goals_match:
        info['has_goals'] = True
        goals = extract_list_items(goals_match, max_items=5)
        if goals:
            info['goals'] = goals
        else:
            # Try to extract from paragraphs
            para = extract_paragraph(goals_match)
            if para:
                info['goals'] = [para]
    
    # Extract Research Questions (try ## and ### headers)
    questions_match = extract_section_content(content, r'##\s+\*?\*?(?:Research\s+)?Questions?\*?\*?\s*\n(.*?)(?=\n##|\Z)')
    if questions_match:
        info['has_questions'] = True
        questions = extract_list_items(questions_match, max_items=8)
        if questions:
            info['questions'] = questions
    
    # Extract Hypotheses (try ## and ### headers)
    hyp_match = extract_section_content(content, r'##\s+\*?\*?Hypothes[ei]s\*?\*?\s*\n(.*?)(?=\n##|\Z)')
    if hyp_match:
        info['has_hypotheses'] = True
        hypotheses = extract_list_items(hyp_match, max_items=5)
        if hypotheses:
            info['hypotheses'] = hypotheses
        else:
            # Try paragraph
            para = extract_paragraph(hyp_match)
            if para:
                info['hypotheses'] = [para]
    
    # Extract Expected Outcomes (try ## and ### headers)
    outcome_match = extract_section_content(content, r'##\s+\*?\*?(?:Expected\s+)?Outcome?s?\*?\*?\s*\n(.*?)(?=\n##|\Z)')
    if outcome_match:
        info['expected_outcomes'] = extract_paragraph(outcome_match)
    
    # Extract Recruitment information (try ## and ### headers)
    recruitment_match = extract_section_content(content, r'##\s+\*?\*?Recruitment\*?\*?\s*\n(.*?)(?=\n##|\Z)')
    if recruitment_match:
        info['has_recruitment'] = True
        info['recruitment_approach'] = extract_paragraph(recruitment_match)
        
        # Look for criteria within recruitment section
        criteria = extract_list_items(recruitment_match, max_items=5)
        if criteria:
            info['primary_criteria'] = criteria
    
    # Extract Methodology (try ## and ### headers)
    methodology_match = extract_section_content(content, r'##\s+\*?\*?Methodology\*?\*?\s*\n(.*?)(?=\n##|\Z)')
    if methodology_match:
        method_text = extract_paragraph(methodology_match)
        if method_text:
            info['methodology'] = method_text[:100]  # Limit length
    
    # If not found or empty, try to detect methodology from content
    if info['methodology'] == 'TBD':
        if re.search(r'tree\s+test', content, re.IGNORECASE):
            info['methodology'] = 'tree testing'
        elif re.search(r'usability\s+test', content, re.IGNORECASE):
            info['methodology'] = 'usability testing'
        elif re.search(r'semi-structured\s+interview', content, re.IGNORECASE):
            info['methodology'] = 'semi-structured interviews'
        elif re.search(r'\binterview', content, re.IGNORECASE):
            info['methodology'] = 'interviews'
        elif re.search(r'card\s+sort', content, re.IGNORECASE):
            info['methodology'] = 'card sort'
    
    return info

def has_placeholder_data(frontmatter_text):
    """Check if frontmatter has placeholder data."""
    placeholder_indicators = [
        'TBD',
        '[Team',
        '[Product',
        '[AUTHOR',
        'YYYY-MM-DD',
        '[First research goal]',
        '[Research question',
        '[e.g.',
    ]
    return any(indicator in frontmatter_text for indicator in placeholder_indicators)

def replace_placeholder_frontmatter(file_path, file_type='research_plan'):
    """Replace placeholder frontmatter with smart extracted content."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Check if file has frontmatter
        if not content.strip().startswith('---'):
            print(f"  ⚠️  File has no frontmatter: {file_path}")
            return False
        
        # Extract frontmatter and body
        parts = content.split('---', 2)
        if len(parts) < 3:
            print(f"  ⚠️  Invalid frontmatter format: {file_path}")
            return False
        
        frontmatter = parts[1]
        body = parts[2]
        
        # Check if frontmatter has placeholders
        if not has_placeholder_data(frontmatter):
            print(f"  ℹ️  No placeholders found: {file_path}")
            return False
        
        # Extract team, product from path
        team, product = extract_team_and_product_from_path(file_path)
        
        # Try to extract date from filename or content
        date_match = re.search(r'20\d{2}-\d{2}', file_path)
        if date_match:
            date = date_match.group(0) + '-01'  # Add day
        else:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Extract info from body content
        content_info = extract_info_from_content(body, file_type)
        
        # Build better title
        title_parts = []
        if team and team not in ['research', 'alt text']:
            title_parts.append(team.replace('-', ' ').title())
        if product and product != team:
            title_parts.append(product.replace('-', ' ').title())
        if date_match:
            title_parts.append(date_match.group(0))
        
        title = f"Research Plan for {', '.join(title_parts)}" if title_parts else f"Research Plan for {team}, {product}, {date}"
        
        # Replace placeholders in frontmatter
        new_frontmatter = frontmatter
        
        # Replace title
        new_frontmatter = re.sub(
            r'title:\s*"Research Plan for \[Team, Product, Date\]"',
            f'title: "{title}"',
            new_frontmatter
        )
        
        # Replace dates
        new_frontmatter = re.sub(r'\bYYYY-MM-DD\b', date, new_frontmatter)
        
        # Replace team
        new_frontmatter = re.sub(
            r'team:\s*"\[Team Name\]"',
            f'team: "{team}"',
            new_frontmatter
        )
        
        # Replace product
        new_frontmatter = re.sub(
            r'product:\s*"\[Product Name\]"',
            f'product: "{product}"',
            new_frontmatter
        )
        
        # Replace methodology if detected
        if content_info['methodology'] != 'TBD':
            new_frontmatter = re.sub(
                r'methodology:\s*"(?:\[e\.g\.,.*?\]|TBD)"',
                f'methodology: "{content_info["methodology"]}"',
                new_frontmatter
            )
        
        # Replace problem statement
        if content_info['problem_statement']:
            new_frontmatter = re.sub(
                r'problem_statement:\s*"(?:\[What problem.*?\]|TBD)"',
                f'problem_statement: "{content_info["problem_statement"]}"',
                new_frontmatter
            )
        
        # Replace research goals
        if content_info['goals']:
            # Build YAML list for goals
            goals_yaml = '\n'.join([f'  - goal_{i+1}: "{goal}"' for i, goal in enumerate(content_info['goals'])])
            # Replace the goals section
            new_frontmatter = re.sub(
                r'research_goals:\s*\n(?:  - goal_\d+:.*\n?)+',
                f'research_goals:\n{goals_yaml}\n',
                new_frontmatter
            )
        
        # Replace research questions
        if content_info['questions']:
            # Build YAML list for questions
            questions_yaml = '\n'.join([f'  - "{q}"' for q in content_info['questions']])
            # Replace the questions section
            new_frontmatter = re.sub(
                r'research_questions:\s*\n(?:  - ".*\n?)+',
                f'research_questions:\n{questions_yaml}\n',
                new_frontmatter
            )
        
        # Replace hypotheses
        if content_info['hypotheses']:
            # Build YAML list for hypotheses
            hypotheses_yaml = '\n'.join([f'  - "{h}"' for h in content_info['hypotheses']])
            # Replace the hypotheses section
            new_frontmatter = re.sub(
                r'hypotheses:\s*\n(?:  - ".*\n?)+',
                f'hypotheses:\n{hypotheses_yaml}\n',
                new_frontmatter
            )
        
        # Replace expected outcomes
        if content_info['expected_outcomes']:
            new_frontmatter = re.sub(
                r'expected_outcomes:\s*"(?:\[How will.*?\]|TBD)"',
                f'expected_outcomes: "{content_info["expected_outcomes"]}"',
                new_frontmatter
            )
        
        # Replace recruitment approach
        if content_info['recruitment_approach']:
            new_frontmatter = re.sub(
                r'approach:\s*"(?:\[e\.g\.,.*?\]|TBD)"',
                f'approach: "{content_info["recruitment_approach"]}"',
                new_frontmatter
            )
        
        # Replace primary criteria
        if content_info['primary_criteria']:
            criteria_yaml = '\n'.join([f'    - "{c}"' for c in content_info['primary_criteria']])
            new_frontmatter = re.sub(
                r'primary_criteria:\s*\n(?:    - ".*\n?)+',
                f'primary_criteria:\n{criteria_yaml}\n',
                new_frontmatter
            )
        
        # Build new content
        new_content = '---' + new_frontmatter + '---' + body
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✅ Replaced placeholders: {file_path}")
        print(f"     Team: {team}, Product: {product}, Date: {date}")
        if content_info['methodology'] != 'TBD':
            print(f"     Methodology: {content_info['methodology']}")
        if content_info['goals']:
            print(f"     Extracted {len(content_info['goals'])} goals")
        if content_info['questions']:
            print(f"     Extracted {len(content_info['questions'])} research questions")
        if content_info['hypotheses']:
            print(f"     Extracted {len(content_info['hypotheses'])} hypotheses")
        if content_info['problem_statement']:
            print(f"     Extracted background/problem statement")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")
        return False

def add_frontmatter_template(file_path, file_type='research_plan'):
    """Add frontmatter template to a file that has none."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Don't add if already has frontmatter
        if content.strip().startswith('---'):
            print(f"  ⚠️  File already has frontmatter: {file_path}")
            return False
        
        # Extract info
        team, product = extract_team_and_product_from_path(file_path)
        date = datetime.now().strftime('%Y-%m-%d')
        
        # Extract additional info from content
        content_info = extract_info_from_content(content, file_type)
        
        # Choose template
        if file_type == 'research_plan':
            template = RESEARCH_PLAN_TEMPLATE
        else:
            template = CONVERSATION_GUIDE_TEMPLATE
        
        # Format template
        frontmatter = template.format(
            team=team,
            product=product,
            date=date
        )
        
        # Add frontmatter to file
        new_content = frontmatter + content
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✅ Added frontmatter template: {file_path}")
        print(f"     Team: {team}, Product: {product}")
        if content_info['has_goals']:
            print(f"     Found {len(content_info['goals'])} goals in content")
        if content_info['has_questions']:
            print(f"     Found {len(content_info['questions'])} questions in content")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")
        return False

def process_batch_from_csv(csv_path, status_filter, file_type_filter=None, limit=None, dry_run=False):
    """Process multiple files from the audit CSV."""
    processed = 0
    success = 0
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['status'] != status_filter:
                continue
            
            if file_type_filter and row['file_type'] != file_type_filter:
                continue
            
            if limit and processed >= limit:
                break
            
            file_path = row['path']
            
            # Skip template files
            if 'template' in file_path.lower() or file_path.startswith('platform/'):
                continue
            
            # Prepend products/ or teams/ or platform/ based on path
            if not file_path.startswith('products/') and not file_path.startswith('teams/') and not file_path.startswith('platform/'):
                # Determine which directory
                if any(file_path.startswith(p) for p in ['digital-experience/', '_archive/', 'vsa/', 'health-products/', 'benefits-portfolio/']):
                    file_path = f"teams/{file_path}"
                else:
                    file_path = f"products/{file_path}"
            
            full_path = os.path.join('/home/runner/work/va.gov-team/va.gov-team', file_path)
            
            if not os.path.exists(full_path):
                print(f"  ⚠️  File not found: {full_path}")
                processed += 1
                continue
            
            print(f"\nProcessing {processed + 1}: {file_path}")
            
            if dry_run:
                print(f"  [DRY RUN] Would process: {file_path}")
                processed += 1
                continue
            
            if status_filter == 'no_frontmatter':
                if add_frontmatter_template(full_path, row['file_type']):
                    success += 1
            elif status_filter == 'has_placeholder':
                if replace_placeholder_frontmatter(full_path, row['file_type']):
                    success += 1
            
            processed += 1
    
    print(f"\n{'='*80}")
    print(f"Batch processing complete:")
    print(f"  Files processed: {processed}")
    print(f"  Successful: {success}")
    print(f"  Failed: {processed - success}")
    print(f"{'='*80}")
    
    return processed, success

def main():
    parser = argparse.ArgumentParser(description='Remediate frontmatter issues')
    parser.add_argument('--mode', choices=['add-template', 'batch'], required=True,
                        help='Mode: add-template for single file, batch for CSV processing')
    parser.add_argument('--file', help='Single file to process')
    parser.add_argument('--file-type', choices=['research_plan', 'conversation_guide'],
                        help='Type of file (for single file mode)')
    parser.add_argument('--csv', default='frontmatter_audit.csv',
                        help='CSV file with audit results')
    parser.add_argument('--status', choices=['no_frontmatter', 'has_placeholder'],
                        help='Filter by status in CSV')
    parser.add_argument('--filter-type', choices=['research_plan', 'conversation_guide'],
                        help='Filter by file type in CSV')
    parser.add_argument('--limit', type=int,
                        help='Limit number of files to process in batch mode')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what would be done without making changes')
    
    args = parser.parse_args()
    
    if args.mode == 'add-template':
        if not args.file or not args.file_type:
            print("Error: --file and --file-type required for add-template mode")
            return 1
        add_frontmatter_template(args.file, args.file_type)
    
    elif args.mode == 'batch':
        if not args.status:
            print("Error: --status required for batch mode")
            return 1
        process_batch_from_csv(args.csv, args.status, args.filter_type, args.limit, args.dry_run)
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
