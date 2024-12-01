export interface Exercise {
    id: number;
    title: string;
    description?: string;
    category: string;
    difficulty?: string;
    instructions?: string;
    benefits?: string;
    muscles_worked?: string;
    variations?: string;
    image_path?: string;
    animation_path?: string;
}
