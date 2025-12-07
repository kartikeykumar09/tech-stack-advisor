export interface Question {
    id: string;
    title: string;
    description: string;
    options: {
        value: string;
        label: string;
        icon?: string;
    }[];
}

export const questions: Question[] = [
    {
        id: 'projectType',
        title: 'What are you building?',
        description: 'Select the type of project that best describes your goal.',
        options: [
            { value: 'webapp', label: 'Web Application', icon: '🌐' },
            { value: 'api', label: 'API / Backend Service', icon: '⚡' },
            { value: 'fullstack', label: 'Full-Stack App', icon: '📦' },
            { value: 'static', label: 'Static / Marketing Site', icon: '📄' },
            { value: 'mobile', label: 'Mobile App', icon: '📱' },
        ]
    },
    {
        id: 'scale',
        title: 'Expected scale?',
        description: 'How many users do you expect in the first year?',
        options: [
            { value: 'mvp', label: 'MVP / Prototype', icon: '🚀' },
            { value: 'small', label: 'Small (< 1K users)', icon: '👥' },
            { value: 'medium', label: 'Medium (1K - 100K)', icon: '🏢' },
            { value: 'large', label: 'Large (100K+)', icon: '🌍' },
        ]
    },
    {
        id: 'experience',
        title: 'Team experience level?',
        description: 'Average skill level of developers on this project.',
        options: [
            { value: 'beginner', label: 'Beginner', icon: '🌱' },
            { value: 'intermediate', label: 'Intermediate', icon: '💪' },
            { value: 'advanced', label: 'Advanced', icon: '🔥' },
        ]
    },
    {
        id: 'priority',
        title: 'What matters most?',
        description: 'Choose your primary optimization goal.',
        options: [
            { value: 'speed', label: 'Speed to Market', icon: '⏱️' },
            { value: 'performance', label: 'Performance', icon: '📈' },
            { value: 'cost', label: 'Low Cost', icon: '💰' },
            { value: 'dx', label: 'Developer Experience', icon: '✨' },
        ]
    },
    {
        id: 'features',
        title: 'Any special requirements?',
        description: 'Select all that apply to your project.',
        options: [
            { value: 'realtime', label: 'Real-time Updates', icon: '🔄' },
            { value: 'seo', label: 'SEO Critical', icon: '🔍' },
            { value: 'ai', label: 'AI/ML Integration', icon: '🤖' },
            { value: 'offline', label: 'Offline Support', icon: '📴' },
            { value: 'none', label: 'None of these', icon: '➖' },
        ]
    }
];
