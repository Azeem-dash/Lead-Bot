import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function PreviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: lead } = await supabase
        .from('leads')
        .select('generated_html')
        .eq('id', id)
        .single();

    if (!lead || !lead.generated_html) {
        notFound();
    }

    return (
        <div
            dangerouslySetInnerHTML={{ __html: lead.generated_html }}
            className="min-h-screen w-full"
        />
    );
}
// This page should not have the global layout (navbar/footer)
export const metadata = {
    title: 'Website Preview - myleadbots.com',
};
