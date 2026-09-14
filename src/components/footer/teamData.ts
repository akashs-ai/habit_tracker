export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  bio: string;
  linkedin: string;
  instagram: string;
  github: string;
  skills: string[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'shubhankar-das',
    name: 'Shubhankar Das',
    role: 'Full-stack Developer',
    initials: 'SD',
    bio: 'Architecting seamless full-stack web applications, robust APIs, and performant user experiences.',
    linkedin: 'https://www.linkedin.com/in/shubhankar05/',
    instagram: 'https://www.instagram.com/shubhankar.d_5?stkn=eGNnd3E5NW13Znk2',
    github: 'https://github.com/shubhankarO5',
    skills: ['React', 'TypeScript', 'Node.js', 'APIs', 'Full-Stack Architecture']
  },
  {
    id: 'soumyajit-guria',
    name: 'Soumyajit Guria',
    role: 'Full-stack Developer',
    initials: 'SG',
    bio: 'Crafting responsive user interfaces, scalable backend systems, and modern interactive web tools.',
    linkedin: 'https://www.linkedin.com/in/soumyajit005/',
    instagram: 'https://www.instagram.com/soumya_jit.exe?stkn=MW9zNnR5NW5qMnh3Ng==',
    github: 'https://github.com/soumyajitguria005-art',
    skills: ['TypeScript', 'Frontend Architecture', 'Cloud Services', 'UI/UX', 'Databases']
  },
  {
    id: 'shubham-si',
    name: 'Shubham Si',
    role: 'Full-stack Developer',
    initials: 'SS',
    bio: 'Specializing in end-to-end full-stack engineering, performance optimization, and gamification mechanics.',
    linkedin: 'https://www.linkedin.com/in/shubham-si-4b3051370?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    instagram: 'https://www.instagram.com/shubham_12.s?stkn=ZHZpa3V0emNtaGs=',
    github: 'https://github.com/shubham07sipm-netizen',
    skills: ['Full-Stack Engineering', 'Gamification', 'State Management', 'React', 'DevOps']
  }
];

export const TEAM_INFO = {
  teamName: 'Team Expo',
  developmentDate: '14 September 2026',
  copyright: '© 2026 Team Expo · All Rights Reserved'
};
