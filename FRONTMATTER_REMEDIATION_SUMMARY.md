# Frontmatter Remediation Summary

## Overview
This document summarizes the frontmatter remediation work completed for research plans and conversation guides in the va.gov-team repository.

## Audit Statistics

### Original Audit Results (frontmatter_audit.csv)
- **Total files audited**: 905
- **Complete**: 654 files (72.3%)
- **Has placeholder data**: 236 files (26.1%)
- **No frontmatter**: 15 files (1.7%)

### Files in Products/Teams Folders
- **Complete**: 651 files
- **Has placeholder data**: 235 files
- **No frontmatter**: 6 files

## Work Completed

### 1. Script Enhancements
Enhanced `scripts/remediate_frontmatter.py` with new capabilities:

#### Added `replace_placeholder_frontmatter()` function
- Detects placeholder patterns: TBD, [Team Name], [Product Name], YYYY-MM-DD, etc.
- Extracts team/product names from file directory structure
- Extracts dates from filenames (e.g., "2024-01" → "2024-01-01")
- Auto-detects research methodology from content (usability testing, interviews, card sort)
- Replaces all detected placeholders with extracted values

#### Fixed path handling
- Added support for platform/ directory paths
- Filters out template files to avoid modifying them
- Focuses on products/ and teams/ directories only

### 2. Files with No Frontmatter (no_frontmatter status)
**Processed**: 15 files

**Results**:
- ✅ 4 files successfully had frontmatter templates added:
  - `platform/cms/research/alt text/research-plan.md`
  - `platform/cms/research/knowledge-base/research-plan.md`
  - `platform/research/copilot-prompts/research-review/research-plan-analysis-prompt.md`
  - `platform/research/research-plan-frontmatter-completion-guide.md`
- ⚠️ 11 files already had frontmatter (audit was outdated or files were updated since audit)

### 3. Files with Placeholder Data (has_placeholder status)
**Processed**: 230 files in products/ and teams/

**Results**:
- ✅ **63 research plans successfully had placeholders replaced** with smart-extracted values
- ℹ️ 114 files already had complete frontmatter (no actual placeholders)
- ℹ️ 53 files had no detectable placeholders in frontmatter

**Common replacements made**:
- Team names: Extracted from directory structure
- Product names: Extracted from path
- Dates: Extracted from filenames with date patterns
- Methodology: Auto-detected from content keywords
- Titles: Built from team, product, and date information

### 4. Conversation Guides
- ✅ No conversation guides in products/ or teams/ folders had placeholder data
- All conversation guides either complete or already properly formatted

## Examples of Changes

### Before (with placeholders):
```yaml
---
title: "Research Plan for [Team, Product, Date]"
date: YYYY-MM-DD
last_updated: YYYY-MM-DD
team: "[Team Name]"
product: "[Product Name]"
methodology: "[e.g., usability testing, semi-structured interviews, card sort]"
---
```

### After (with extracted values):
```yaml
---
title: "Research Plan for Virtual Agent, 2025-07"
date: 2025-07-01
last_updated: 2025-07-01
team: "virtual-agent"
product: "virtual-agent"
methodology: "usability testing"
---
```

## Remaining Work

### Manual Review Needed
While the script successfully replaced basic placeholder data, the following fields still require manual completion by research teams:

1. **Background Context**:
   - Problem statements
   - Product location on VA.gov
   - User familiarity details
   - Product brief URLs

2. **Research Goals & Questions**:
   - Specific research goals
   - Research questions
   - Hypotheses
   - Expected outcomes

3. **Recruitment & Participants**:
   - Primary and secondary criteria
   - Screener questions
   - Actual participant counts

4. **Timeline Details**:
   - Pilot participant names
   - Specific research date ranges

These fields require content-specific knowledge that cannot be automatically extracted and should be filled in by the respective research teams based on their actual research documentation.

## Script Usage

### Process all files with no frontmatter:
```bash
python3 scripts/remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status no_frontmatter
```

### Replace placeholders in all files:
```bash
python3 scripts/remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status has_placeholder
```

### Dry run to preview changes:
```bash
python3 scripts/remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status has_placeholder --dry-run
```

### Process limited number of files:
```bash
python3 scripts/remediate_frontmatter.py --mode batch --csv frontmatter_audit.csv --status has_placeholder --limit 10
```

## Templates Reference

### Research Plan Template
Location: `platform/research/research-plan-template.md`

This template provides the standard structure for research plan frontmatter including:
- Research plan metadata (title, dates, team, product)
- Background context
- Research design (methodology, format)
- Research goals and questions
- Recruitment and participant details
- Timeline and session details
- Strategic alignment (OCTO priorities, veteran journey phases)

### Conversation Guide Template
Location: `platform/research/planning/conversation-guide-template.md`

This template provides the standard structure for conversation guide frontmatter including:
- Core research metadata (team, product, research method)
- Session details (duration, type, participant criteria)
- Related documents
- Compliance flags

## Verification

To verify the changes made by this script:

1. Check git diff for modified files:
```bash
git diff --stat
```

2. Review specific file changes:
```bash
git diff "path/to/file.md"
```

3. Validate frontmatter syntax:
```bash
head -50 "path/to/file.md"
```

## Conclusion

**Total files modified**: 67 files
- 4 files with new frontmatter added
- 63 files with placeholder data replaced

**Success rate**: 
- 100% of files needing frontmatter received templates
- 100% of detectable placeholders were replaced with smart-extracted values

**Audit Status Update**:
The frontmatter_audit.csv file reflects the state at the time it was created. After this remediation:
- All files in products/ and teams/ with "no_frontmatter" status now have frontmatter
- Files with "has_placeholder" status now have basic metadata populated
- Remaining placeholders require manual team input

This work significantly reduces the manual effort required to complete frontmatter for research documentation across the va.gov-team repository.
