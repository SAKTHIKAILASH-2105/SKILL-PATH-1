import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('skillpath_user_id')?.value || 'usr_aarav';
    const body = await req.json();
    const { plan, billingCycle } = body; // 'pro' | 'enterprise', 'monthly' | 'quarterly' | 'annual'

    const tier = plan || 'pro';
    const months = billingCycle === 'annual' ? 12 : billingCycle === 'quarterly' ? 3 : 1;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    const updatedUser = db.updateUser(userId, {
      subscriptionTier: tier,
      subscriptionExpiresAt: expiry.toISOString(),
    });

    db.addAgentLog({
      userId,
      agentName: 'Adaptive Recommendation Agent',
      agentRole: 'Dynamic Curriculum Adaptation',
      status: 'completed',
      input: { plan: tier, billingCycle, months },
      output: { tier, expiresAt: expiry.toISOString() },
      summary: `Subscription upgrade confirmed: ${updatedUser.name} upgraded to ${tier.toUpperCase()} (${billingCycle}). All premium learning resources and enterprise masterclasses unlocked!`,
      decisionImpact: `Unlocked all premium masterclasses and enterprise capstone modules across the roadmap.`,
    });

    return NextResponse.json({
      user: updatedUser,
      message: `Successfully upgraded to ${tier.toUpperCase()} plan (${billingCycle})!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Subscription failed' }, { status: 500 });
  }
}
