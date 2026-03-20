const CONFIDENCE_DENOMINATOR_FACTOR = 0.3;

// Keyword taxonomy used for enrichment suggestions only.
const ENRICHMENT_TAXONOMY = {
  finding_types: {
    usability_issue: [
      'difficult',
      'struggle',
      'confus',
      'unclear',
      'hard to',
      'barrier',
      'friction',
      'unintuitive',
      'problematic',
    ],
    accessibility_barrier: [
      'screen reader',
      'keyboard',
      'accessibility',
      'wcag',
      'low vision',
      'deaf',
      'voiceover',
      'jaws',
      'nvda',
      'captions',
    ],
    positive_feedback: [
      'easy',
      'intuitive',
      'clear',
      'successful',
      'helpful',
      'confident',
      'satisfied',
      'works well',
      'great',
    ],
    content_confusion: ['wording', 'language', 'jargon', 'label', 'content', 'ambiguous', 'misleading'],
    technical_problem: ['bug', 'crash', 'slow', 'timeout', 'broken', 'error', 'failed'],
    unmet_need: ['need', 'want', 'wish', 'missing', 'lack', 'gap', 'would like'],
    workflow_insight: ['workflow', 'process', 'steps', 'journey', 'task flow'],
    behavioral_pattern: ['pattern', 'typically', 'consistently', 'workaround', 'habit'],
  },
  product_areas: {
    health_care: ['health', 'medical', 'appointment', 'prescription', 'provider', 'care'],
    claims_appeals: ['claim', 'appeal', 'decision review', 'rating', 'compensation'],
    education: ['education', 'gi bill', 'school', 'tuition'],
    housing: ['home loan', 'coe', 'housing', 'mortgage'],
    profile_account: ['account', 'profile', 'settings'],
    records_documents: ['dd-214', 'record', 'document', 'letter', 'upload'],
    benefits: ['benefits', 'eligibility', 'qualify'],
    appointments: ['appointment', 'schedule', 'reschedule', 'vaos'],
    secure_messaging: ['secure message', 'myhealthevet', 'inbox'],
    prescriptions: ['prescription', 'medication', 'refill', 'pharmacy'],
  },
  user_groups: {
    veterans: ['veteran', 'former service member'],
    caregivers: ['caregiver', 'caretaker'],
    family_members: ['spouse', 'family member', 'next of kin'],
    service_members: ['active duty', 'service member', 'transitioning'],
    dependents: ['dependent', 'child'],
    survivors: ['survivor', 'widow', 'widower'],
    low_digital_literacy: ['not tech savvy', 'struggle with technology', 'not comfortable online'],
    rural_location: ['rural', 'remote area', 'slow internet'],
    cognitive_considerations: ['tbi', 'ptsd', 'memory issues', 'cognitive'],
  },
  research_themes: {
    navigation_wayfinding: ['navigate', 'navigation', 'find', 'wayfinding', 'lost'],
    form_completion: ['form', 'submit', 'fill out', 'required field', 'validation'],
    authentication_login: ['sign in', 'log in', 'login.gov', 'id.me', 'mfa', 'password'],
    content_comprehension: ['confusing language', 'unclear', 'plain language', 'misunderstood'],
    trust_credibility: ['trust', 'scam', 'legitimate', 'verify', 'confidence'],
    task_completion: ['completed', 'abandoned', 'gave up', 'failed to'],
    mobile_experience: ['mobile', 'phone', 'touch', 'responsive'],
    pain_points: ['frustrating', 'difficult', 'struggle', 'obstacle'],
    user_satisfaction: ['satisfied', 'happy', 'would recommend'],
    help_support: ['help', 'support', 'faq', 'documentation'],
  },
  journey_stages: {
    discovery: ['learning about', 'researching', 'exploring options'],
    eligibility_checking: ['eligible', 'qualify', 'requirements'],
    application: ['applying', 'application', 'submit'],
    waiting_period: ['waiting', 'pending', 'how long'],
    appeal: ['appeal', 'reconsideration'],
    ongoing_management: ['ongoing', 'monthly', 'manage benefits'],
    life_change_update: ['change of address', 'new dependent', 'report change'],
  },
  severity_levels: {
    critical: ['cannot complete', 'completely blocked', 'critical failure'],
    high: ['major issue', 'significant barrier', 'workaround needed'],
    medium: ['frustrating', 'extra steps', 'took longer'],
    low: ['minor', 'cosmetic', 'small issue'],
    enhancement: ['enhancement', 'nice to have', 'improvement'],
  },
  emotional_states: {
    frustrated: ['frustrated', 'angry', 'annoyed'],
    confused: ['confused', "don't understand", 'unclear'],
    anxious: ['worried', 'anxious', 'stressed'],
    overwhelmed: ['overwhelmed', 'too much'],
    confident: ['confident', 'certain'],
    empowered: ['empowered', 'in control'],
    skeptical: ['skeptical', 'doubt', 'suspicious'],
    relieved: ['relieved', 'finally'],
  },
};

function validateEnrichmentTaxonomy(taxonomy) {
  if (!taxonomy || typeof taxonomy !== 'object' || Array.isArray(taxonomy)) {
    throw new Error('enrichment taxonomy must be an object');
  }

  for (const [dimension, labels] of Object.entries(taxonomy)) {
    if (!labels || typeof labels !== 'object' || Array.isArray(labels)) {
      throw new Error(`taxonomy dimension ${dimension} must be an object`);
    }

    for (const [label, keywords] of Object.entries(labels)) {
      if (!Array.isArray(keywords) || keywords.length === 0) {
        throw new Error(`taxonomy label ${dimension}.${label} must have a non-empty keyword array`);
      }

      for (const keyword of keywords) {
        if (typeof keyword !== 'string' || !keyword.trim()) {
          throw new Error(`taxonomy label ${dimension}.${label} has invalid keyword`);
        }
      }
    }
  }
}

validateEnrichmentTaxonomy(ENRICHMENT_TAXONOMY);

module.exports = {
  CONFIDENCE_DENOMINATOR_FACTOR,
  ENRICHMENT_TAXONOMY,
  validateEnrichmentTaxonomy,
};
