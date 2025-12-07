export type Category = 'frontend' | 'backend' | 'database' | 'hosting';

export interface Technology {
    id: string;
    name: string;
    category: Category;
    logo: string; // emoji for simplicity
    description: string;
    pros: string[];
    cons: string[];
    learnMore: string;
    scores: {
        projectType: Record<string, number>;
        scale: Record<string, number>;
        experience: Record<string, number>;
        priority: Record<string, number>;
        features: Record<string, number>;
    };
}

export const technologies: Technology[] = [
    // FRONTEND
    {
        id: 'nextjs',
        name: 'Next.js',
        category: 'frontend',
        logo: '▲',
        description: 'React framework with SSR, SSG, and API routes built-in.',
        pros: ['Great SEO', 'Fast builds', 'Vercel integration', 'App Router'],
        cons: ['Learning curve', 'Vercel lock-in risk'],
        learnMore: 'https://nextjs.org/docs',
        scores: {
            projectType: { webapp: 10, fullstack: 10, static: 8, api: 3, mobile: 2 },
            scale: { mvp: 9, small: 10, medium: 10, large: 9 },
            experience: { beginner: 7, intermediate: 10, advanced: 9 },
            priority: { speed: 10, performance: 9, cost: 7, dx: 10 },
            features: { seo: 10, realtime: 6, ai: 7, offline: 5, none: 8 }
        }
    },
    {
        id: 'vite-react',
        name: 'Vite + React',
        category: 'frontend',
        logo: '⚡',
        description: 'Lightning-fast build tool with React for SPAs.',
        pros: ['Extremely fast HMR', 'Simple setup', 'Flexible'],
        cons: ['No SSR by default', 'Less opinionated'],
        learnMore: 'https://vitejs.dev',
        scores: {
            projectType: { webapp: 9, fullstack: 7, static: 6, api: 2, mobile: 3 },
            scale: { mvp: 10, small: 9, medium: 8, large: 7 },
            experience: { beginner: 9, intermediate: 10, advanced: 9 },
            priority: { speed: 10, performance: 8, cost: 10, dx: 10 },
            features: { seo: 3, realtime: 7, ai: 6, offline: 6, none: 9 }
        }
    },
    {
        id: 'astro',
        name: 'Astro',
        category: 'frontend',
        logo: '🚀',
        description: 'Content-focused framework with zero JS by default.',
        pros: ['Blazing fast', 'Island architecture', 'Any UI library'],
        cons: ['Limited interactivity', 'Newer ecosystem'],
        learnMore: 'https://astro.build',
        scores: {
            projectType: { webapp: 5, fullstack: 4, static: 10, api: 1, mobile: 1 },
            scale: { mvp: 8, small: 9, medium: 8, large: 7 },
            experience: { beginner: 8, intermediate: 9, advanced: 8 },
            priority: { speed: 9, performance: 10, cost: 10, dx: 8 },
            features: { seo: 10, realtime: 2, ai: 4, offline: 3, none: 9 }
        }
    },

    // BACKEND
    {
        id: 'nodejs',
        name: 'Node.js + Express',
        category: 'backend',
        logo: '🟢',
        description: 'JavaScript runtime with the classic Express framework.',
        pros: ['Huge ecosystem', 'Easy to learn', 'Same language as frontend'],
        cons: ['Callback complexity', 'Single-threaded'],
        learnMore: 'https://expressjs.com',
        scores: {
            projectType: { webapp: 8, fullstack: 9, static: 3, api: 10, mobile: 7 },
            scale: { mvp: 10, small: 10, medium: 9, large: 7 },
            experience: { beginner: 10, intermediate: 9, advanced: 8 },
            priority: { speed: 10, performance: 7, cost: 9, dx: 9 },
            features: { seo: 5, realtime: 9, ai: 7, offline: 5, none: 8 }
        }
    },
    {
        id: 'python-fastapi',
        name: 'Python + FastAPI',
        category: 'backend',
        logo: '🐍',
        description: 'Modern, fast Python framework with automatic OpenAPI docs.',
        pros: ['Type hints', 'Auto docs', 'Great for ML'],
        cons: ['Python deployment', 'Smaller web ecosystem'],
        learnMore: 'https://fastapi.tiangolo.com',
        scores: {
            projectType: { webapp: 6, fullstack: 7, static: 2, api: 10, mobile: 6 },
            scale: { mvp: 9, small: 9, medium: 10, large: 9 },
            experience: { beginner: 7, intermediate: 10, advanced: 10 },
            priority: { speed: 8, performance: 9, cost: 8, dx: 9 },
            features: { seo: 3, realtime: 7, ai: 10, offline: 3, none: 7 }
        }
    },
    {
        id: 'supabase',
        name: 'Supabase',
        category: 'backend',
        logo: '⚡',
        description: 'Open-source Firebase alternative with Postgres.',
        pros: ['Instant APIs', 'Auth built-in', 'Real-time', 'Free tier'],
        cons: ['Vendor lock-in', 'Complex queries need SQL'],
        learnMore: 'https://supabase.com/docs',
        scores: {
            projectType: { webapp: 9, fullstack: 10, static: 4, api: 8, mobile: 9 },
            scale: { mvp: 10, small: 10, medium: 9, large: 7 },
            experience: { beginner: 10, intermediate: 9, advanced: 7 },
            priority: { speed: 10, performance: 8, cost: 10, dx: 10 },
            features: { seo: 4, realtime: 10, ai: 6, offline: 5, none: 9 }
        }
    },

    // DATABASE
    {
        id: 'postgres',
        name: 'PostgreSQL',
        category: 'database',
        logo: '🐘',
        description: 'The world\'s most advanced open-source relational database.',
        pros: ['ACID compliant', 'JSON support', 'Extensions'],
        cons: ['Complex setup', 'Scaling requires expertise'],
        learnMore: 'https://www.postgresql.org/docs/',
        scores: {
            projectType: { webapp: 10, fullstack: 10, static: 3, api: 10, mobile: 8 },
            scale: { mvp: 8, small: 9, medium: 10, large: 10 },
            experience: { beginner: 6, intermediate: 9, advanced: 10 },
            priority: { speed: 7, performance: 10, cost: 8, dx: 7 },
            features: { seo: 5, realtime: 8, ai: 9, offline: 4, none: 8 }
        }
    },
    {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'database',
        logo: '🍃',
        description: 'Flexible document database for modern applications.',
        pros: ['Schema flexibility', 'Easy scaling', 'Atlas cloud'],
        cons: ['No joins', 'Consistency trade-offs'],
        learnMore: 'https://www.mongodb.com/docs/',
        scores: {
            projectType: { webapp: 8, fullstack: 9, static: 2, api: 9, mobile: 9 },
            scale: { mvp: 10, small: 10, medium: 9, large: 8 },
            experience: { beginner: 9, intermediate: 9, advanced: 8 },
            priority: { speed: 10, performance: 8, cost: 8, dx: 9 },
            features: { seo: 4, realtime: 8, ai: 7, offline: 7, none: 8 }
        }
    },
    {
        id: 'sqlite',
        name: 'SQLite',
        category: 'database',
        logo: '📦',
        description: 'Serverless, embedded SQL database. Zero configuration.',
        pros: ['No server needed', 'Portable', 'Fast for reads'],
        cons: ['Single writer', 'Not for high concurrency'],
        learnMore: 'https://sqlite.org/docs.html',
        scores: {
            projectType: { webapp: 6, fullstack: 7, static: 8, api: 7, mobile: 10 },
            scale: { mvp: 10, small: 9, medium: 5, large: 2 },
            experience: { beginner: 10, intermediate: 8, advanced: 7 },
            priority: { speed: 10, performance: 7, cost: 10, dx: 9 },
            features: { seo: 5, realtime: 3, ai: 5, offline: 10, none: 8 }
        }
    },

    // HOSTING
    {
        id: 'vercel',
        name: 'Vercel',
        category: 'hosting',
        logo: '▲',
        description: 'Deploy frontend and serverless functions instantly.',
        pros: ['Zero config', 'Preview deploys', 'Edge functions'],
        cons: ['Expensive at scale', 'Lock-in for Next.js'],
        learnMore: 'https://vercel.com/docs',
        scores: {
            projectType: { webapp: 10, fullstack: 9, static: 10, api: 7, mobile: 3 },
            scale: { mvp: 10, small: 10, medium: 8, large: 6 },
            experience: { beginner: 10, intermediate: 10, advanced: 8 },
            priority: { speed: 10, performance: 9, cost: 6, dx: 10 },
            features: { seo: 9, realtime: 6, ai: 7, offline: 5, none: 9 }
        }
    },
    {
        id: 'railway',
        name: 'Railway',
        category: 'hosting',
        logo: '🚂',
        description: 'Deploy anything with a Dockerfile or buildpack.',
        pros: ['Simple pricing', 'Database hosting', 'Good DX'],
        cons: ['Newer platform', 'Limited regions'],
        learnMore: 'https://docs.railway.app',
        scores: {
            projectType: { webapp: 8, fullstack: 10, static: 6, api: 10, mobile: 5 },
            scale: { mvp: 10, small: 10, medium: 9, large: 7 },
            experience: { beginner: 9, intermediate: 10, advanced: 9 },
            priority: { speed: 9, performance: 8, cost: 8, dx: 10 },
            features: { seo: 6, realtime: 8, ai: 8, offline: 4, none: 8 }
        }
    },
    {
        id: 'aws',
        name: 'AWS',
        category: 'hosting',
        logo: '☁️',
        description: 'The most comprehensive cloud platform.',
        pros: ['Infinite scale', 'Every service imaginable'],
        cons: ['Complex', 'Expensive mistakes possible'],
        learnMore: 'https://aws.amazon.com/documentation/',
        scores: {
            projectType: { webapp: 8, fullstack: 9, static: 7, api: 10, mobile: 7 },
            scale: { mvp: 5, small: 7, medium: 9, large: 10 },
            experience: { beginner: 3, intermediate: 7, advanced: 10 },
            priority: { speed: 5, performance: 10, cost: 6, dx: 5 },
            features: { seo: 7, realtime: 9, ai: 10, offline: 6, none: 7 }
        }
    }
];

// Helper function to calculate scores
export function calculateRecommendations(answers: Record<string, string>) {
    const results: { tech: Technology; score: number }[] = [];

    for (const tech of technologies) {
        let score = 0;

        if (answers.projectType && tech.scores.projectType[answers.projectType]) {
            score += tech.scores.projectType[answers.projectType] * 2; // Weight project type higher
        }
        if (answers.scale && tech.scores.scale[answers.scale]) {
            score += tech.scores.scale[answers.scale];
        }
        if (answers.experience && tech.scores.experience[answers.experience]) {
            score += tech.scores.experience[answers.experience];
        }
        if (answers.priority && tech.scores.priority[answers.priority]) {
            score += tech.scores.priority[answers.priority] * 1.5; // Weight priority
        }
        if (answers.features && tech.scores.features[answers.features]) {
            score += tech.scores.features[answers.features];
        }

        results.push({ tech, score });
    }

    // Group by category and get top for each
    const categories: Category[] = ['frontend', 'backend', 'database', 'hosting'];
    const recommendations: Record<Category, Technology[]> = {
        frontend: [],
        backend: [],
        database: [],
        hosting: []
    };

    for (const category of categories) {
        const categoryResults = results
            .filter(r => r.tech.category === category)
            .sort((a, b) => b.score - a.score);

        recommendations[category] = categoryResults.slice(0, 2).map(r => r.tech);
    }

    return recommendations;
}
