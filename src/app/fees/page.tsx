"use client";

import { Header } from "@/components";

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            creator fees
          </h1>
          <p className="text-gray-500">
            how usdc.fun rewards long-term holders with fee distribution
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-1">1%</div>
              <div className="text-sm text-gray-500">trading fee</div>
            </div>
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-3xl font-bold text-[#2775ca] mb-1">0.5%</div>
              <div className="text-sm text-gray-500">to diamond hands</div>
            </div>
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-1">0.5%</div>
              <div className="text-sm text-gray-500">to protocol</div>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="space-y-8">
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              fee distribution mechanism
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              usdc.fun implements a time-weighted fee distribution system that rewards holders based on their holding duration. 
              this mechanism incentivizes long-term commitment and discourages rapid speculation.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#2775ca] font-mono text-sm">01</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">trade execution</h3>
                  <p className="text-gray-500 text-sm">
                    when a trade occurs, 1% of the transaction value is collected as a fee. 
                    this happens atomically within the same transaction using a CPI call to the fee vault program.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#2775ca] font-mono text-sm">02</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">holder scoring</h3>
                  <p className="text-gray-500 text-sm">
                    each holder accumulates a time-weighted score calculated as: <code className="text-[#2775ca] bg-gray-100 px-1.5 py-0.5 rounded text-xs">score = token_balance * holding_duration_seconds</code>. 
                    scores are updated on every transfer event and stored in a merkle tree for gas efficiency.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#2775ca] font-mono text-sm">03</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">epoch distribution</h3>
                  <p className="text-gray-500 text-sm">
                    every 24 hours, an epoch concludes and fees are distributed. 
                    each holder receives: <code className="text-[#2775ca] bg-gray-100 px-1.5 py-0.5 rounded text-xs">reward = (holder_score / total_score) * epoch_fees * 0.5</code>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#2775ca] font-mono text-sm">04</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">claim mechanism</h3>
                  <p className="text-gray-500 text-sm">
                    rewards are claimable via merkle proof verification. 
                    unclaimed rewards accumulate and can be claimed at any time with no expiration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Holding Multiplier */}
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              diamond hands multiplier
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              holders who maintain their position receive exponentially increasing rewards through the diamond hands multiplier.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-gray-500 font-medium">holding period</th>
                    <th className="text-left py-3 text-gray-500 font-medium">multiplier</th>
                    <th className="text-left py-3 text-gray-500 font-medium">effective rate</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-3">0 - 24 hours</td>
                    <td className="py-3">1.0x</td>
                    <td className="py-3 text-gray-500">base rate</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3">1 - 7 days</td>
                    <td className="py-3 text-[#2775ca]">1.5x</td>
                    <td className="py-3 text-gray-500">+50% rewards</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3">7 - 30 days</td>
                    <td className="py-3 text-[#2775ca]">2.0x</td>
                    <td className="py-3 text-gray-500">+100% rewards</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3">30 - 90 days</td>
                    <td className="py-3 text-[#2775ca]">3.0x</td>
                    <td className="py-3 text-gray-500">+200% rewards</td>
                  </tr>
                  <tr>
                    <td className="py-3">90+ days</td>
                    <td className="py-3 text-[#2775ca]">5.0x</td>
                    <td className="py-3 text-gray-500">+400% rewards</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Implementation */}
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              technical implementation
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-gray-900 font-medium mb-2">on-chain programs</h3>
                <ul className="text-gray-500 space-y-1.5">
                  <li>fee_vault.so - collects and stores trading fees per token</li>
                  <li>holder_registry.so - tracks holder scores using compressed state</li>
                  <li>distributor.so - handles epoch finalization and merkle root updates</li>
                  <li>claim.so - verifies merkle proofs and transfers rewards</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-gray-900 font-medium mb-2">account structure</h3>
                <pre className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto text-gray-600">
{`struct HolderAccount {
    owner: Pubkey,           // 32 bytes
    token_mint: Pubkey,      // 32 bytes
    balance: u64,            // 8 bytes
    first_buy_slot: u64,     // 8 bytes
    last_update_slot: u64,   // 8 bytes
    cumulative_score: u128,  // 16 bytes
    claimed_epoch: u32,      // 4 bytes
}`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-gray-900 font-medium mb-2">score calculation</h3>
                <pre className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto text-gray-600">
{`fn update_score(holder: &mut HolderAccount, current_slot: u64) {
    let slots_held = current_slot - holder.last_update_slot;
    let time_score = holder.balance * slots_held as u128;
    let multiplier = get_multiplier(holder.first_buy_slot, current_slot);
    holder.cumulative_score += time_score * multiplier;
    holder.last_update_slot = current_slot;
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              frequently asked questions
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-900 font-medium mb-1">when can i claim my rewards?</h3>
                <p className="text-gray-500 text-sm">
                  rewards become claimable after each 24-hour epoch ends. you can claim at any time - rewards never expire.
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-900 font-medium mb-1">what happens if i sell some tokens?</h3>
                <p className="text-gray-500 text-sm">
                  your score is recalculated based on your new balance. the holding duration for remaining tokens is preserved. 
                  selling resets the multiplier tier for the sold portion only.
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-900 font-medium mb-1">is there a minimum holding amount?</h3>
                <p className="text-gray-500 text-sm">
                  no minimum. any holder with a non-zero balance participates in fee distribution proportional to their time-weighted score.
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-900 font-medium mb-1">how is this different from staking?</h3>
                <p className="text-gray-500 text-sm">
                  tokens remain liquid - no locking required. you earn rewards simply by holding in your wallet. 
                  you can sell at any time without unstaking penalties.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <span>usdc.fun</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">twitter</a>
            <a href="#" className="hover:text-gray-600 transition-colors">telegram</a>
            <a href="#" className="hover:text-gray-600 transition-colors">docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
