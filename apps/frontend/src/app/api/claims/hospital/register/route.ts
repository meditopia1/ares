import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient, requireAnyRole } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

const registerSelect = `
  id,
  row_type,
  workbook_row_number,
  workspace_year,
  workspace_month,
  auth_number,
  date_of_claim_reported_received,
  dol,
  claim_number,
  member_number,
  surname,
  initials,
  patient_name,
  id_number_principal_member,
  gender,
  patient_dob,
  relationship,
  total_claims_incurred,
  finalised_paid_to_date,
  claims_outstanding,
  actual_costs_invoices_received,
  member_costs,
  accident,
  illness,
  death,
  dread,
  extension,
  casualty_admitted_hospital,
  ex_gratia,
  repudiation_claim_amount,
  status,
  group_name,
  cause,
  hospital,
  length_of_stay,
  beneficiary,
  beneficiary_death_payment_id,
  beneficiary_death_surname_initials,
  payment_date,
  plan,
  inception_date,
  icd10_code,
  province,
  policy_period,
  practice_number,
  member_id
`;

const editableRegisterFields = new Set([
  'auth_number',
  'date_of_claim_reported_received',
  'dol',
  'claim_number',
  'member_number',
  'surname',
  'initials',
  'patient_name',
  'id_number_principal_member',
  'gender',
  'patient_dob',
  'relationship',
  'total_claims_incurred',
  'finalised_paid_to_date',
  'claims_outstanding',
  'actual_costs_invoices_received',
  'member_costs',
  'accident',
  'illness',
  'death',
  'dread',
  'extension',
  'casualty_admitted_hospital',
  'ex_gratia',
  'repudiation_claim_amount',
  'status',
  'group_name',
  'cause',
  'hospital',
  'length_of_stay',
  'beneficiary',
  'beneficiary_death_payment_id',
  'beneficiary_death_surname_initials',
  'payment_date',
  'plan',
  'inception_date',
  'icd10_code',
  'province',
  'policy_period',
  'practice_number',
]);

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, ['claims', 'admin', 'system_admin', 'operations_manager', 'finance_manager']);

    const searchParams = request.nextUrl.searchParams;
    const year = Number(searchParams.get('year') || '2026');
    const includeSubtotals = searchParams.get('include_subtotals') === 'true';
    const supabase = createServiceRoleSupabaseClient();

    let query = supabase
      .from('hospital_claims_register')
      .select(registerSelect)
      .eq('workspace_year', year)
      .order('workbook_row_number', { ascending: true });

    if (!includeSubtotals) {
      query = query.eq('row_type', 'claim');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      rows: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Failed to fetch hospital claims register:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital claims register', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAnyRole(request, ['claims', 'admin', 'system_admin', 'operations_manager', 'finance_manager']);

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const incomingUpdates = body.updates && typeof body.updates === 'object' ? body.updates : {};

    if (!id) {
      return NextResponse.json({ error: 'Missing register row id' }, { status: 400 });
    }

    const updates = Object.fromEntries(
      Object.entries(incomingUpdates).filter(([key]) => editableRegisterFields.has(key))
    );

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No editable fields supplied' }, { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from('hospital_claims_register')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(registerSelect)
      .single();

    if (error) throw error;

    return NextResponse.json({ row: data });
  } catch (error) {
    console.error('Failed to update hospital claims register:', error);
    return NextResponse.json(
      { error: 'Failed to update hospital claims register', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
