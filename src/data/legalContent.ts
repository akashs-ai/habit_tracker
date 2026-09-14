export interface LegalSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  version: string;
  lastUpdated: string;
  effectiveDate: string;
  introduction: string;
  sections: LegalSection[];
  contactEmail: string;
}

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: 'Terms & Conditions',
  version: '2.1',
  lastUpdated: 'March 14, 2026',
  effectiveDate: 'March 14, 2026',
  introduction:
    'Welcome to LifeRPG. These Terms & Conditions ("Terms") form a legally binding agreement between you ("User", "you", or "your") and LifeRPG ("Platform", "we", "us", or "our") governing your access to and use of the LifeRPG habit-tracking, personal productivity, and self-improvement application across all platforms and web interfaces. Please read these Terms carefully before creating an account.',
  contactEmail: 'support@liferpg.app',
  sections: [
    {
      id: 'eligibility',
      number: '1',
      title: 'Account Creation & Eligibility',
      summary: 'Requirements to create an account and access the platform.',
      paragraphs: [
        'To create an account and use LifeRPG, you must be at least 13 years of age (or the minimum legal age required in your jurisdiction to consent to online services). If you are under 18 years old, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.',
        'You agree to provide accurate, current, and complete information during registration, and to maintain and promptly update your profile information to keep it accurate and complete. Each user may create only one individual account; automated, scripted, or shared accounts are strictly prohibited.',
      ],
      bullets: [
        'Must be at least 13 years old to register.',
        'Provide valid, authentic registration details.',
        'One personal account per individual user.',
      ],
    },
    {
      id: 'username-rules',
      number: '2',
      title: 'Username Rules & Reservation',
      summary: 'Guidelines for choosing and maintaining your unique username handle.',
      paragraphs: [
        'Your username is your unique public identifier across the LifeRPG platform. Usernames must comply with our formatting and community integrity rules. Username comparison is case-insensitive for uniqueness (for example, "Alex" and "alex" cannot both exist).',
        'We reserve the right to reclaim, modify, or reassign usernames that violate trademark rights, impersonate other individuals or entities, contain offensive or abusive terminology, or remain dormant on inactive accounts for an extended duration.',
      ],
      bullets: [
        'Allowed characters: Letters (A-Z, a-z), numbers (0-9), underscores (_), and periods (.).',
        'No spaces, emoji, symbols, or special characters other than "_" and "." are permitted.',
        'Length must be between 3 and 30 characters.',
        'No impersonation of other individuals, creators, organizations, or LifeRPG staff.',
        'Usernames with hate speech, vulgarity, or harassment are subject to immediate termination.',
      ],
    },
    {
      id: 'account-security',
      number: '3',
      title: 'Account Security & Password Responsibility',
      summary: 'Your obligations to safeguard your login credentials.',
      paragraphs: [
        'You are solely responsible for maintaining the confidentiality of your login credentials, including your password and access tokens. LifeRPG enforces strong password criteria during registration to help secure your account against unauthorized access.',
        'You agree to notify LifeRPG support immediately if you suspect or discover any unauthorized access to or compromise of your account. LifeRPG is not liable for losses or damages resulting from unauthorized activity conducted through your credentials.',
      ],
      bullets: [
        'Passwords must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.',
        'Plaintext passwords are never stored by our systems; all passwords are cryptographically hashed.',
        'Never disclose your password, secret recovery tokens, or session keys to third parties.',
      ],
    },
    {
      id: 'acceptable-use',
      number: '4',
      title: 'Acceptable Use Policy',
      summary: 'Standards of lawful and respectful conduct on the platform.',
      paragraphs: [
        'LifeRPG is built to foster positive personal development, daily discipline, and goal accomplishment. You agree to use the application solely for lawful, authorized, and non-commercial personal productivity purposes.',
        'You may not use LifeRPG to engage in any activity that harms, harasses, defrauds, or disrupts other users, our servers, or connected third-party networks.',
      ],
    },
    {
      id: 'user-content',
      number: '5',
      title: 'User-Generated Content & Ownership',
      summary: 'You retain full ownership of your personal habits, tasks, goals, and notes.',
      paragraphs: [
        'You retain all intellectual property rights and ownership over all content, habits, routines, task lists, calendar entries, reflection notes, and personal goals that you author and record within LifeRPG ("User Content").',
        'By using the service, you grant LifeRPG a limited, non-exclusive, revocable license solely to store, process, display, and synchronize your User Content as necessary to operate and provide the features of the application to you.',
      ],
      bullets: [
        'You own 100% of your personal habit, task, and journal data.',
        'We never sell your personal data or user content to advertisers or third-party data brokers.',
        'You may export your data or delete your account and all associated content at any time.',
      ],
    },
    {
      id: 'habit-data',
      number: '6',
      title: 'Habit, Task & Goal Data Synchronization',
      summary: 'How progress tracking and offline synchronization are managed.',
      paragraphs: [
        'LifeRPG provides real-time tracking, streak counters, and performance analytics based on your check-ins. While the platform utilizes offline caches for responsive local interaction, authoritative progress records are synchronized with central cloud datastores.',
        'In the event of synchronization conflicts between cached client devices and authoritative servers, cloud timestamps and transaction logs govern progression state reconciliations.',
      ],
    },
    {
      id: 'ai-guidance',
      number: '7',
      title: 'AI-Generated Recommendations & Coaching Guidance',
      summary: 'Important disclaimers regarding AI coaching and automated suggestions.',
      paragraphs: [
        'LifeRPG offers AI-powered features, including habit coaches, goal breakdown assistants, and performance summaries powered by artificial intelligence models. These AI suggestions are generated automatically to offer motivation, organizational frameworks, and habit-building strategies.',
        'AI guidance is provided for general informational, educational, and motivational purposes only. AI responses do NOT constitute medical advice, mental health diagnosis, psychiatric therapy, legal advice, or financial counseling. Always consult qualified healthcare or professional providers for medical, mental health, or critical life decisions.',
      ],
      bullets: [
        'AI recommendations are informational and motivational, not professional advice.',
        'LifeRPG does not guarantee the accuracy, completeness, or suitability of AI outputs.',
        'Users should exercise independent discretion before adopting strenuous physical routines.',
      ],
    },
    {
      id: 'rewards-system',
      number: '8',
      title: 'Rewards, Progression & Achievement Systems',
      summary: 'Rules governing virtual Momentum Points, XP, levels, and digital unlocks.',
      paragraphs: [
        'LifeRPG features gamification elements, including Experience Points (XP), Levels, Momentum Points (MP), consistency streaks, digital badges, and cosmetic unlocks (such as UI themes, profile avatars, and badges).',
        'All XP, points, levels, and badges are virtual game mechanics intended solely to motivate your personal consistency. They have no cash value, cannot be redeemed for real-world currency or monetary equivalents, and cannot be transferred, sold, or bartered outside the application.',
      ],
      bullets: [
        'Virtual points and badges have zero monetary, real-world, or cash value.',
        'Unlocks are personal to your account and non-transferable.',
        'Exploiting calculation defects to fabricate points violates our integrity rules.',
      ],
    },
    {
      id: 'social-features',
      number: '9',
      title: 'Friends & Social Features',
      summary: 'Interacting with other users, leaderboards, and shared challenges.',
      paragraphs: [
        'LifeRPG allows you to connect with friends via username handles, participate in mutual progress challenges, and view friendly consistency leaderboards. You are expected to treat all community members with courtesy and mutual respect.',
        'You may block or remove connections at any time. Harassment, stalking, unsolicited spam, offensive usernames, or abusive messages directed toward other members will result in immediate social feature restriction or account termination.',
      ],
    },
    {
      id: 'prohibited-activities',
      number: '10',
      title: 'Prohibited Activities & System Abuse',
      summary: 'Forbidden technical and behavioral activities.',
      paragraphs: [
        'You agree not to engage in any prohibited conduct, including without limitation: deploying automated scripts or bots to simulate task completion; reverse engineering, decompiling, or probing platform source code; circumventing authentication, rate limits, or security controls; or attempting denial-of-service attacks.',
      ],
      bullets: [
        'No automated botting or completion scripts.',
        'No vulnerability scanning, scraping, or payload tampering.',
        'No distribution of malware, viruses, or malicious links.',
        'No harassment, hate speech, or impersonation of others.',
      ],
    },
    {
      id: 'termination',
      number: '11',
      title: 'Account Suspension & Termination',
      summary: 'Circumstances under which accounts may be terminated or deleted.',
      paragraphs: [
        'You may terminate your account at any time via the Account Settings panel. Upon account deletion, your profile, authentication records, and user data are permanently purged in accordance with our Privacy Policy.',
        'LifeRPG reserves the right to suspend or terminate accounts that breach these Terms, violate username or acceptable use rules, engage in fraudulent activity, or create security liabilities for the platform or other users.',
      ],
    },
    {
      id: 'privacy-handling',
      number: '12',
      title: 'Privacy & Data Handling',
      summary: 'Our commitment to protecting your personal information.',
      paragraphs: [
        'Your privacy is fundamental to our service design. Our collection, processing, storage, and protection of your personal information are governed by our Privacy Policy, which is incorporated into and forms an integral part of these Terms.',
      ],
    },
    {
      id: 'third-party-auth',
      number: '13',
      title: 'Third-Party Authentication Providers',
      summary: 'Signing in with Google, Discord, or GitHub OAuth.',
      paragraphs: [
        'You may choose to authenticate using third-party services, including Google, Discord, and GitHub. When using third-party sign-in, you authorize LifeRPG to verify your identity and receive basic account profile data (such as verified email address and public display name).',
        'Your relationship with third-party providers is governed by their respective terms of service and privacy policies. LifeRPG does not control and is not responsible for third-party service availability or security.',
      ],
    },
    {
      id: 'service-availability',
      number: '14',
      title: 'Service Availability & Maintenance',
      summary: 'Platform uptime, scheduled updates, and feature changes.',
      paragraphs: [
        'We strive to maintain continuous availability and high reliability. However, the service may be occasionally interrupted for scheduled maintenance, updates, infrastructure improvements, or emergency repairs. LifeRPG does not guarantee uninterrupted or error-free operation.',
      ],
    },
    {
      id: 'changes-to-service',
      number: '15',
      title: 'Changes to the Service & Revisions to Terms',
      summary: 'How updates to these Terms and features are communicated.',
      paragraphs: [
        'We may modify these Terms from time to time to reflect new features, operational enhancements, or legal requirements. Material updates will be announced via an in-app notice or notification banner.',
        'Your continued use of LifeRPG following the posting of updated Terms constitutes your acceptance of the revised Terms. If you do not agree to updated Terms, you must discontinue using the service.',
      ],
    },
    {
      id: 'liability',
      number: '16',
      title: 'Limitation of Liability & Warranty Disclaimer',
      summary: 'Standard platform liability limitations and "as is" provisions.',
      paragraphs: [
        'LifeRPG is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, statutory, or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.',
        'To the maximum extent permitted by applicable law, LifeRPG and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your access to or inability to access the platform.',
      ],
    },
    {
      id: 'contact',
      number: '17',
      title: 'Contact Information & Support',
      summary: 'How to reach our team with questions or feedback.',
      paragraphs: [
        'If you have questions, feedback, or concerns regarding these Terms & Conditions or platform operations, please contact our support team at support@liferpg.app or through the in-app Help and Feedback drawer.',
      ],
    },
    {
      id: 'governing-law',
      number: '18',
      title: 'Governing Law & Dispute Resolution',
      summary: 'Applicable legal jurisdiction and informal dispute resolution.',
      paragraphs: [
        'These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.',
        'In the event of any controversy or dispute, the parties agree to first attempt in good faith to resolve the matter informally through written communication before initiating formal legal proceedings.',
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  version: '2.1',
  lastUpdated: 'March 14, 2026',
  effectiveDate: 'March 14, 2026',
  introduction:
    'LifeRPG ("we", "us", or "our") respects your privacy and is dedicated to protecting your personal information. This Privacy Policy explains what data we collect when you use our habit tracker, personal productivity system, and AI coaching platform, how we use and safeguard that data, and the rights you have to manage or delete your information.',
  contactEmail: 'privacy@liferpg.app',
  sections: [
    {
      id: 'information-collected',
      number: '1',
      title: 'What Account Information We Collect',
      summary: 'Data collected during account creation and profile setup.',
      paragraphs: [
        'When you create a LifeRPG account, we collect basic account credentials and profile attributes necessary to establish and authenticate your identity:',
      ],
      bullets: [
        'Username: A unique public identifier chosen by you, normalized for case-insensitive uniqueness.',
        'Email Address: Used for login verification, security notifications, and critical transactional notices.',
        'Display Name & Avatar: Your preferred name and visual profile picture for dashboard personalization.',
        'Timezone & Locale: Used to accurately anchor daily reset cycles, streak calculations, and calendar reminders.',
        'Guest Explorer Data: Temporary identifier and progress state if you explore without signing in.',
      ],
    },
    {
      id: 'auth-info',
      number: '2',
      title: 'Authentication & Credential Security',
      summary: 'How we store and verify your authentication information.',
      paragraphs: [
        'We treat your security credentials with the highest level of care. We NEVER store plaintext passwords anywhere on our servers or databases. All passwords are cryptographically salted and hashed using modern algorithms (scrypt) before storage.',
        'When you log in, authentication tokens (JWT or secure session tokens) are issued to keep you securely signed in. Session tokens expire automatically and can be revoked at any time by logging out.',
      ],
      bullets: [
        'Zero plaintext passwords stored — all credentials use salted cryptographic hashing.',
        'Tokens are transmitted exclusively over encrypted HTTPS/TLS connections.',
        'Session tokens feature automated expiration and one-click manual invalidation.',
      ],
    },
    {
      id: 'habit-activity-data',
      number: '3',
      title: 'Habit, Task, Goal & Activity Records',
      summary: 'Personal productivity data you record within the app.',
      paragraphs: [
        'To deliver a meaningful habit tracking experience, we record the activities and milestones you log:',
      ],
      bullets: [
        'Habits & Quests: Habit titles, frequencies, categories, and completion timestamps.',
        'Streak History: Consecutive days completed and consistency percentage calculations.',
        'Tasks & Calendar: Task items, priority levels, scheduled times, and completion states.',
        'Goals & Milestones: Long-term targets, milestone increments, and target completion dates.',
        'Reflection Notes: Personal journal entries and productivity memos.',
        'Rewards & Unlocks: Momentum Points earned, transaction histories, and claimed cosmetic themes.',
      ],
    },
    {
      id: 'how-data-used',
      number: '4',
      title: 'How We Use Your Data',
      summary: 'The specific, legitimate purposes for which your data is processed.',
      paragraphs: [
        'We use your data solely to provide, personalize, and improve the LifeRPG experience. Specifically, we use your data to:',
      ],
      bullets: [
        'Maintain your personalized dashboard, habits, and daily task queues.',
        'Calculate accurate streak counters, XP level progression, and weekly consistency reports.',
        'Synchronize your progress securely across your devices in real time.',
        'Provide tailored AI coaching reflections based on your self-reported habits.',
        'Facilitate friendly social challenges with friends you explicitly accept.',
        'Protect platform security, prevent unauthorized access, and troubleshoot software defects.',
      ],
    },
    {
      id: 'ai-processing',
      number: '5',
      title: 'AI-Related Processing & Model Safeguards',
      summary: 'How artificial intelligence models interact with your queries.',
      paragraphs: [
        'When you interact with the AI Coach or request automated task breakdowns, your prompt and relevant habit context (such as your current streak or active habit categories) are processed through secure server-side AI model interfaces.',
        'We do NOT sell your habit logs or prompts to third-party AI data companies. Your personal habit logs are NOT used to train public generative AI foundation models without your explicit consent.',
      ],
      bullets: [
        'All AI queries are processed through server-side proxies; API keys are never exposed.',
        'Habit context sent to AI is limited to what is relevant for generating coaching guidance.',
        'User prompts are not repurposed to train public foundation models.',
      ],
    },
    {
      id: 'social-visibility',
      number: '6',
      title: 'Social & Friends Functionality',
      summary: 'What other users can and cannot see about your profile.',
      paragraphs: [
        'Your privacy within the community is strictly controlled. By default, other users can only see your public profile fields:',
      ],
      bullets: [
        'Visible to Friends: Your unique username, display name, avatar, Level, and public badges.',
        'NEVER Visible to Friends: Your private task descriptions, journal notes, exact schedule times, and personal reflection logs.',
        'You have full control over friend requests and can block or unfriend any user at any time.',
      ],
    },
    {
      id: 'third-party-oauth',
      number: '7',
      title: 'Third-Party OAuth Authentication Providers',
      summary: 'Data exchanged when logging in with Google, Discord, or GitHub.',
      paragraphs: [
        'If you sign in using Google, Discord, or GitHub, we request only the minimal permissions required to authenticate your account (such as verified email address, public profile name, and avatar image).',
        'We never request or access your contacts, private repositories, Discord server memberships, or unauthorized permissions.',
      ],
    },
    {
      id: 'storage-isolation',
      number: '8',
      title: 'Data Storage & Multi-Tenant User Isolation',
      summary: 'How user stores are segregated and protected.',
      paragraphs: [
        'LifeRPG employs strict multi-user data isolation. In our database architecture, every record (habit, task, goal, note, reward) is bound to your authenticated user ID.',
        'Row-Level Security (RLS) policies and user-context middleware ensure that your data can never be read, modified, or queried by other users.',
      ],
    },
    {
      id: 'data-security',
      number: '9',
      title: 'Data Security & Protection Standards',
      summary: 'Technical safeguards protecting your information.',
      paragraphs: [
        'We implement industry-standard technical and organizational measures to safeguard your information against unauthorized access, loss, or alteration:',
      ],
      bullets: [
        'All data in transit is encrypted using Transport Layer Security (TLS/HTTPS).',
        'Passwords are cryptographically salted and hashed using scrypt.',
        'Continuous automated health checks and anomaly monitoring.',
        'Access controls restricting backend data access to authorized systems.',
      ],
    },
    {
      id: 'data-retention',
      number: '10',
      title: 'Data Retention & Lifecycle',
      summary: 'How long your data is stored and maintained.',
      paragraphs: [
        'We retain your account and habit tracking records for as long as your account remains active. If you choose to delete your account, your data is permanently erased from active datastores immediately.',
      ],
    },
    {
      id: 'user-rights',
      number: '11',
      title: 'Your Privacy Rights',
      summary: 'Your rights to inspect, export, update, and manage your data.',
      paragraphs: [
        'Regardless of your geographic location, LifeRPG provides you with comprehensive control over your personal data:',
      ],
      bullets: [
        'Right to Access: View all profile data, habit logs, and statistics in your settings.',
        'Right to Rectify: Update your display name, username, email, and preferences at any time.',
        'Right to Portability: Export your complete habit and goal data in standard JSON format.',
        'Right to Erasure: Permanently delete your account and all associated records with one click.',
      ],
    },
    {
      id: 'account-deletion',
      number: '12',
      title: 'Complete Account & Data Deletion',
      summary: 'How to permanently wipe your account and all records.',
      paragraphs: [
        'You have the absolute right to delete your account at any time. Inside Account Settings, selecting "Delete Account" initiates an irreversible purge that removes your user record, authentication credentials, habits, tasks, calendar events, reflection notes, and reward balances.',
      ],
    },
    {
      id: 'contact-privacy',
      number: '13',
      title: 'Contact Information for Privacy Queries',
      summary: 'How to contact our Data Protection and Privacy team.',
      paragraphs: [
        'If you have questions, requests regarding your personal data, or wish to exercise any of your privacy rights, please email us at privacy@liferpg.app. We respond to all verified privacy inquiries promptly.',
      ],
    },
  ],
};
