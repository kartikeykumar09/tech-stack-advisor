export type AIProvider = 'openai' | 'gemini';

export interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    model: string;
}

export interface AIModel {
    id: string;
    name: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    recommendations?: AIRecommendation;
    suggestions?: string[];
}

export interface AIRecommendation {
    frontend?: {
        name: string;
        reason: string;
        alternatives: string[];
    };
    backend?: {
        name: string;
        reason: string;
        alternatives: string[];
    };
    database?: {
        name: string;
        reason: string;
        alternatives: string[];
    };
    hosting?: {
        name: string;
        reason: string;
        alternatives: string[];
    };
    summary?: string;
    followUp?: string;
}

export interface AIResponse {
    text: string;
    suggestions?: string[];
    recommendations?: AIRecommendation;
}

// Default models
export const defaultModels: Record<AIProvider, AIModel[]> = {
    openai: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cheap)' },
        { id: 'gpt-4o', name: 'GPT-4o (Most Capable)' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy)' },
    ],
    gemini: [
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Latest)' },
        { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash' },
        { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
    ]
};

// localStorage helpers
export const saveApiKey = (provider: AIProvider, key: string) => {
    localStorage.setItem(`techstack_api_key_${provider}`, key);
};

export const getApiKey = (provider: AIProvider): string | null => {
    return localStorage.getItem(`techstack_api_key_${provider}`);
};

export const clearApiKey = (provider: AIProvider) => {
    localStorage.removeItem(`techstack_api_key_${provider}`);
};

export const saveSelectedModel = (provider: AIProvider, modelId: string) => {
    localStorage.setItem(`techstack_model_${provider}`, modelId);
};

export const getSelectedModel = (provider: AIProvider): string => {
    return localStorage.getItem(`techstack_model_${provider}`) || defaultModels[provider][0].id;
};

// Fetch available models from OpenAI
export const fetchOpenAIModels = async (apiKey: string): Promise<AIModel[]> => {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) throw new Error('Failed to fetch models');

        const data = await response.json();
        const chatModels = data.data
            .filter((m: { id: string }) =>
                m.id.includes('gpt-4') || m.id.includes('gpt-3.5')
            )
            .map((m: { id: string }) => ({
                id: m.id,
                name: m.id
            }))
            .sort((a: AIModel, b: AIModel) => a.id.localeCompare(b.id));

        return chatModels.length > 0 ? chatModels : defaultModels.openai;
    } catch {
        return defaultModels.openai;
    }
};

// Fetch available models from Gemini
export const fetchGeminiModels = async (apiKey: string): Promise<AIModel[]> => {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) throw new Error('Failed to fetch models');

        const data = await response.json();
        const models = data.models
            .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
                m.supportedGenerationMethods?.includes('generateContent') &&
                (m.name.includes('gemini'))
            )
            .map((m: { name: string; displayName: string }) => ({
                id: m.name.replace('models/', ''),
                name: m.displayName || m.name.replace('models/', '')
            }));

        return models.length > 0 ? models : defaultModels.gemini;
    } catch {
        return defaultModels.gemini;
    }
};

// Build the system prompt with structured response format
const getSystemPrompt = (): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return `You are a senior software architect helping developers choose the optimal tech stack. Current date: ${currentDate}.

IMPORTANT: You MUST respond with a valid JSON object in this exact format:

{
  "text": "Your conversational response here. Use markdown for formatting (bold with **text**, numbered lists with 1. 2. 3., etc.)",
  "suggestions": ["Button 1", "Button 2", "Button 3"]
}

The "suggestions" array should contain 3-5 quick reply options that the user can click. Make them short and actionable.

CONVERSATION FLOW:
1. First, ask about their project type. Suggestions might be: ["Web App", "Mobile App", "E-commerce", "Blog/Portfolio", "API/Backend"]
2. Then ask about their experience level. Suggestions: ["Beginner", "Intermediate", "Advanced"]
3. Ask about their priorities. Suggestions: ["Fast Development", "Scalability", "Low Cost", "Performance"]
4. Ask about expected scale. Suggestions: ["Personal Project", "Startup/Small", "Enterprise/Large"]

When you have enough information (usually after 3-4 exchanges), provide final recommendations in this format:
{
  "text": "Based on your requirements, here are my recommendations:",
  "suggestions": ["Explain frontend choice", "Explain backend choice", "Start over"],
  "recommendations": {
    "frontend": {
      "name": "Technology Name",
      "reason": "Why this is best (2-3 sentences)",
      "alternatives": ["Alt1", "Alt2"]
    },
    "backend": {
      "name": "Technology Name", 
      "reason": "Why this is best",
      "alternatives": ["Alt1", "Alt2"]
    },
    "database": {
      "name": "Technology Name",
      "reason": "Why this is best",
      "alternatives": ["Alt1", "Alt2"]
    },
    "hosting": {
      "name": "Technology Name",
      "reason": "Why this is best",
      "alternatives": ["Alt1", "Alt2"]
    },
    "summary": "A 2-sentence summary of why this stack works well together."
  }
}

Remember: ALWAYS respond with valid JSON. The "text" field is required. The "suggestions" field should have relevant quick-reply options.`;
};

// Call OpenAI API
export const callOpenAI = async (
    messages: { role: string; content: string }[],
    apiKey: string,
    model: string
): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: getSystemPrompt() },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
};

// Call Google Gemini API
export const callGemini = async (
    messages: { role: string; content: string }[],
    apiKey: string,
    model: string
): Promise<string> => {
    // Build conversation history
    const contents = messages.map((msg, index) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{
            text: index === 0
                ? `${getSystemPrompt()}\n\nUser's message: ${msg.content}`
                : msg.content
        }]
    }));

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                    responseMimeType: 'application/json'
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// Parse the structured AI response
export const parseAIResponse = (content: string): AIResponse => {
    try {
        let jsonStr = content;

        // Check for JSON code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else if (content.includes('{') && content.includes('}')) {
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}') + 1;
            jsonStr = content.slice(start, end);
        }

        const parsed = JSON.parse(jsonStr.trim());

        return {
            text: parsed.text || content,
            suggestions: parsed.suggestions || [],
            recommendations: parsed.recommendations || null
        };
    } catch {
        // If parsing fails, return the raw content with default suggestions
        return {
            text: content,
            suggestions: ['Tell me more', 'Show recommendations', 'Start over']
        };
    }
};

// Main chat function
export const sendChatMessage = async (
    messages: Message[],
    config: AIConfig
): Promise<{ content: string; recommendations: AIRecommendation | null; suggestions: string[] }> => {
    const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.content
    }));

    let response: string;

    switch (config.provider) {
        case 'openai':
            response = await callOpenAI(formattedMessages, config.apiKey, config.model);
            break;
        case 'gemini':
            response = await callGemini(formattedMessages, config.apiKey, config.model);
            break;
        default:
            throw new Error('Unknown AI provider');
    }

    const parsed = parseAIResponse(response);

    return {
        content: parsed.text,
        recommendations: parsed.recommendations || null,
        suggestions: parsed.suggestions || []
    };
};
