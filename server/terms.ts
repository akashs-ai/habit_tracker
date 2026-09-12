export interface RewardTermsSection {
  id: string;
  title: string;
  content: string;
  bullets?: string[];
}

export interface RewardTermsPolicy {
  version: string;
  lastUpdated: string;
  title: string;
  summary: string;
  sections: RewardTermsSection[];
}

export const REWARD_TERMS_POLICY: RewardTermsPolicy = {
  version: '2025.1',
  lastUpdated: 'March 11, 2025',
  title: 'LifeRPG Reward Claim Terms & Eligibility Policy',
  summary: 'This Policy establishes the authoritative rules, eligibility criteria, and conditions governing the unlocking and claiming of cosmetic and feature rewards within the LifeRPG platform.',
  sections: [
    {
      id: 'eligibility',
      title: '1. Reward Eligibility',
      content: 'A user may claim and unlock a reward only when all prerequisite eligibility conditions specified in the Reward Catalog have been fully satisfied. Conditions may include minimum Level thresholds, active Habit Streak length, specific Badge completions, and sufficient available Momentum Points (MP).',
      bullets: [
        'Users must possess the required balance of Momentum Points at the exact time of claim.',
        'Prerequisite milestones (e.g. 7-day or 30-day consistency streaks) must be validated prior to unlocking.',
        'The system reserves the right to withhold rewards if minimum criteria are not met.'
      ]
    },
    {
      id: 'accurate-progress',
      title: '2. Accurate Progress & Authoritative Data',
      content: 'Reward eligibility is determined exclusively using backend-verified application activity and progression records. Client-side, cached, or transient frontend values are non-authoritative and will be reconciled against the central server database during claim evaluation.',
      bullets: [
        'Any discrepancies between local browser caches and the server will resolve in favor of the server record.',
        'Offline actions must successfully sync and validate before contributing to claim eligibility.'
      ]
    },
    {
      id: 'one-time-claims',
      title: '3. One-Time & Limited Claims',
      content: 'Unless explicitly designated as a repeatable or consumable unlock, all rewards (including Themes, Icon Packs, Commemorative Badges, and Profile Frames) are single-claim items. The backend enforces unique transaction constraints to prevent duplicate claims.',
      bullets: [
        'Once claimed and unlocked, an item is permanently bound to the user profile.',
        'Attempting duplicate claims on already owned assets will be rejected by the server.'
      ]
    },
    {
      id: 'availability',
      title: '4. Reward Availability & Catalog Changes',
      content: 'Rewards, featured items, seasonal badges, and cosmetic themes are subject to availability, rotational scheduling, expiration, and capacity limits defined by LifeRPG. LifeRPG reserves the right to retire or rotate items with reasonable notice.',
      bullets: [
        'Items marked limited-edition are available strictly while active in the catalog.',
        'Owned rewards will remain accessible in the user inventory even if retired from the public catalog.'
      ]
    },
    {
      id: 'verification',
      title: '5. Verification of Activity & Progress',
      content: 'To safeguard the integrity of the progression economy, the application performs automated audits of the user’s logged habits, task completions, streaks, and milestone history before finalizing any reward issuance.',
      bullets: [
        'Automated checks verify realistic time intervals between completed tasks and habits.',
        'Claims made with suspicious or erratic activity patterns will undergo secondary validation.'
      ]
    },
    {
      id: 'approval',
      title: '6. Claim Approval & Fulfillment',
      content: 'Submitting a claim request transmits the transaction to the backend verification engine. While cosmetic themes and digital badges are typically unlocked instantaneously upon approval, high-tier or exclusive rewards may require asynchronous ledger processing.',
      bullets: [
        'A unique Claim Transaction ID is generated for every successfully processed claim.',
        'Deduction of Momentum Points occurs synchronously with asset provisioning.'
      ]
    },
    {
      id: 'abuse-manipulation',
      title: '7. Abuse, Exploitation & Manipulation Prohibited',
      content: 'LifeRPG operates on an honor system grounded in genuine personal development. Any attempt to artificially manipulate activity logs, tamper with API payloads, exploit software defects, deploy automated completion scripts, or execute race-condition claims is strictly prohibited.',
      bullets: [
        'Violations will result in immediate revocation of claimed rewards and forfeited Momentum Points.',
        'Persistent or egregious manipulation may lead to account suspension or permanent progression reset.'
      ]
    },
    {
      id: 'modifications',
      title: '8. Modifications to Terms & Reward Costs',
      content: 'LifeRPG reserves the right to modify point costs, eligibility criteria, and this policy periodically to maintain balanced gamification dynamics. Material changes will be communicated through the in-app announcement banner or notification drawer.',
      bullets: [
        'Cost updates will not retroactively affect previously claimed items.',
        'Continued use of the rewards system following policy revisions constitutes acceptance of the updated terms.'
      ]
    },
    {
      id: 'final-status',
      title: '9. Authoritative Server Ledger & Final Claim Status',
      content: 'The centralized LifeRPG database retains the conclusive, final record of all user balances, inventory holdings, active cosmetic themes, and claim histories. In any dispute regarding reward eligibility or ownership status, server ledger logs are decisive.',
      bullets: [
        'All claims generate a cryptographically indexed record containing timestamp, user ID, and reward specification.',
        'Users can review their active and claimed inventory at any time within the Rewards workspace.'
      ]
    }
  ]
};
