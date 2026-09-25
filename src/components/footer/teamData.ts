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
  profileImage?: string;
  bannerImage?: string;
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
    skills: ['React', 'TypeScript', 'Node.js', 'APIs', 'Full-Stack Architecture'],
    profileImage: 'https://serpapi.com/images/url/FzlAAXichVDLjpswAJR66ZeUG4ltMIZKVsVm8yCbR_MAIi4IGwIhwdDYmwCf2q9pxH5ADyONZkYjzfz99r1QqpE_x2PJa6EyoXRZckOHI56Ki5Aqye9JNeJ1NX6MFYYjGxGb6NAZW9iCBGGCYkiclwpMDIFDbOgYsWXYNoEIGTZxADaBaZNYjMom_yVVQ1Op9BePJcSgfSFWytJiwWOeKAoh0DhnlOh40OQlpWfCOcdads5p1i1RFOKSof3tZOyLqPMsT7x1DEUNmwdnPr-VK5EaaWe26_f8ubque0-AH8b70FYXnLbLoEVu4kbpbkeum8dzNpvX3uHL59RNm3618K6Tz0AUHku2x0QtNh_tJWVNxnZVM-NHq5IbfvJNyw9Q8_BQGXbZh5Os0YbsS3e-vWO_O8Xh7nAqvH65kOE2mgz9vaLIHFih6P8eH3L5a38_6Svzeljyeruun2BqHX2XuV_3SEqYZTtaXVAAYne33JKD79mLheHVnYDg9idg3X7emfsoYY0f_r6feXDAWTW9ulqdUct9I1Nn4v4DgUOpkw'
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
    skills: ['TypeScript', 'Frontend Architecture', 'Cloud Services', 'UI/UX', 'Databases'],
    profileImage: 'https://serpapi.com/images/url/cmMirHichVDLjqMwAJP2sl-y3GiTAElYKVrRmbZDKTN90scFhdACLQ2oydApn7pfs4j5gD1YsmzLkv33x89c61r9Hg6VqKQ-SW1yXVomHIhUFlJpnt35bSCq27AZagcOKCKUmNAdUkiQi10MYkgBcCGCdidQSiGOLUpAF8MUIAJtC7gYxXJwqbM_StcsVdrseKygA746xFpjI5YiFlwzCFxDiIQR0-k1VaTsTIQQjnE6Z-z0nKHjzrkkaFXurVV-fPrYl6Nngo51Mo3OYlpe5jK10qf9Fb5mj_k1bH0JflmvfVuVC5a_BZMMTt6bw3ZJru_NYwzuLW--fcG89N5exu0L2tHGbdZR0t4TL0Bm5m5DnT0WdVljf3atM9vCOdnhzWc0ni_sjV_y1aYMXkYXr7gdxstxSOT8HASY77fpvjz1_a1myO5Zrtn_Hu9zWbffmqYtfwtMp4HrMC_ahaoOZPl9j2Ik4VQYVc4AiL3l7GA3eXKrP1y-jNRVfvDZurE9pWb1-gjdvPDt2I6ueFSYnlGdGPZGZIJGzj8Wi6j8'
  },
  {
    id: 'shubham-si',
    name: 'Shubham Si',
    role: 'Full-stack Developer',
    initials: 'SS',
    bio: 'Specializing in end-to-end full-stack engineering, performance optimization, and gamification mechanics.',
    linkedin: 'https://www.linkedin.com/in/shubham-si-4b3051370?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    instagram: 'https://www.instagram.com/shubham_12.s?stkn=ZHZpa3V0emNtaGs=',
    github: 'https://github.com/shubhamsi503',
    skills: ['Full-Stack Engineering', 'Gamification', 'State Management', 'React', 'DevOps'],
    profileImage: 'https://serpapi.com/images/url/nUbml3icdVHbrqJAEMx-zPqGXIcZNplsUFdFhRVylJWXCcxw8-jAgRHBT90_2bdDOM_70El1dXclVf33279CiLr9IcstrbhIuZhTxkveijhv4vucVne5kwVQ50iDCEqqJSMVGCbSLYuoSDGhqiNoWhAaQAPEVBBQgYWssTXHCwUYhM-vdf6zFTVmrZBGTFoVKP1YRAhzRjglNBZYVdQZpQmGEpi4tmQ4g5RSMEuzHKfDTotCcE204PZHD4pocEyHL4ZEi-pkc87o5nY9cKazwejdVf48vLsvhyvf9dWkVhUU9_fT8Ovtqdwcw4fvXvdc57vklH3NKbZZdSw_jg69d9cFe148exN9OHoLaZys9j4oozjuSjssHpd6KVwYpI3rFVl-DDnyb2sFaSlcJ027bxgL6yXg3qkyl8Z20n8JrBkTKgT-b9TTQj4a71UJLTMJ-TsIYfC72xJeRfZXLi2GiYmsWVVgRSG2v79kDYxIxuPHpdiScLM_M8sqz00uHV6e-zB2i5Hss0AL8lmVYtNeoPEvxicJaqX-'
  },
  {
    id: 'akash-samanta',
    name: 'Akash Samanta',
    role: 'Full-stack Developer',
    initials: 'AS',
    bio: 'Building scalable full-stack web applications, intuitive user interfaces, and robust systems.',
    linkedin: 'https://www.linkedin.com/in/akash-samanta-ai18?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    instagram: 'https://www.instagram.com/wzz.ashuu_?stkn=c2E4OWh5YnczMWVw',
    github: 'https://github.com/akashs-ai',
    skills: ['React', 'Node.js', 'TypeScript', 'Full-Stack Architecture', 'APIs'],
    profileImage: 'https://serpapi.com/images/url/6xe1s3ichZDvbpswFMW1hxnfCLYB251kTaQslCykoV1YyxcENv8TTINbQh51j7EnGKIPsA_36Ojeq590zp8vfyul-uGbYQxcdirvlJ6qk6nDFRdd3Q0qLS_pecXl2fgwlA1XFBFKdHhnEIIwhACiBFJgEoAgvaN0VggSm2IILItCbBMbIWRSmnSrpi-_D6pnYlD67JMB2uA6T6IU1pKOJzxVbEZqnGeM6PayG2rBCsI5t7W8KFk-bVH8224y9HR6MZ-qePKx362nDMV95kUF907NrhOmmKxr4Jbjrg1ufge-mu5CkxVnDXmv9k7Z9rtjSNr9x_ij4Q9O_XnnzBGypOHl_hK94AhjV8UNT38-Oq3DH_jbuagPr3RqKTqKg7l1p3UdepuoTfXgOXimezmG63BB3RRD1uIqxf5X7vJXzlHzSFy3vMrDC0lFfLm50S9ZOZ9NDIxkKeWarBgAiRPuNsCDFibT0ZfiFd_e_CLz3uPQG7NA9qNOsXvYmLj06DnUZM6ws6Zwc0__ASjRosQ'
  }
];

export const TEAM_INFO = {
  teamName: 'Team Expo',
  developmentDate: '14 September 2026',
  copyright: '© 2026 Team Expo · All Rights Reserved'
};
