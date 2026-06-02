import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { buildPolicySectionsFromBrochure } from '@/lib/policy-wording-import';

export const dynamic = 'force-dynamic';

type SectionItemPayload = {
  sectionType?: string;
  title?: string;
  content?: string;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, monthly_premium')
      .eq('id', params.id)
      .maybeSingle()

    if (productError) {
      console.error('Error fetching product for policy sections:', productError)
      return NextResponse.json(
        { error: 'Failed to fetch product for policy sections' },
        { status: 500 }
      )
    }

    let { data: sectionItems, error } = await supabase
      .from('policy_section_items')
      .select('*')
      .eq('product_id', params.id)
      .order('section_type')
      .order('display_order');

    if (error) {
      console.error('Error fetching policy sections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch policy sections' },
        { status: 500 }
      );
    }

    if (product && (!sectionItems || sectionItems.length === 0)) {
      const { data: productBenefits, error: benefitsError } = await supabase
        .from('product_benefits')
        .select('name, description, waiting_period_days, pre_existing_exclusion_days, exclusions')
        .eq('product_id', params.id)

      if (benefitsError) {
        console.error('Error fetching product benefits for policy section import:', benefitsError)
      } else {
        const importedSections = await buildPolicySectionsFromBrochure(product, productBenefits || [])
        if (importedSections.length > 0) {
          const { data: insertedSections, error: insertError } = await supabase
            .from('policy_section_items')
            .insert(importedSections)
            .select('*')
            .order('section_type')
            .order('display_order')

          if (insertError) {
            console.error('Error importing policy sections from brochure:', insertError)
          } else {
            sectionItems = insertedSections || []
          }
        }
      }
    }

    // Group items by section_type
    const sections: any = {};
    sectionItems?.forEach((item: any) => {
      if (!sections[item.section_type]) {
        sections[item.section_type] = [];
      }
      sections[item.section_type].push(item);
    });

    return NextResponse.json({
      sections,
      definitions: [],
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch policy sections' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const body = (await request.json()) as SectionItemPayload;
    const sectionType = body.sectionType?.trim();
    const title = body.title?.trim() || null;
    const content = body.content?.trim();

    if (!sectionType || !content) {
      return NextResponse.json(
        { error: 'sectionType and content are required' },
        { status: 400 }
      );
    }

    const { data: lastItem } = await supabase
      .from('policy_section_items')
      .select('display_order')
      .eq('product_id', params.id)
      .eq('section_type', sectionType)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextDisplayOrder = (lastItem?.display_order || 0) + 1;

    const { data: createdItem, error } = await supabase
      .from('policy_section_items')
      .insert({
        product_id: params.id,
        section_type: sectionType,
        title,
        content,
        display_order: nextDisplayOrder,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating policy section item:', error);
      return NextResponse.json(
        { error: 'Failed to create policy section item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: createdItem });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create policy section item' },
      { status: 500 }
    );
  }
}
