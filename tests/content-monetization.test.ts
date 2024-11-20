;; tests/content-monetization_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that users can mint tokens and tip posts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Mint tokens
    let block = chain.mineBlock([
      Tx.contractCall('content-monetization', 'mint-tokens', [
        types.uint(1000),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Create a post
    block = chain.mineBlock([
      Tx.contractCall('content-storage', 'create-post', [
        types.utf8("Tipping test post"),
        types.ascii("QmTipTestHash")
      ], wallet2.address)
    ]);
    
    // Tip the post
    block = chain.mineBlock([
      Tx.contractCall('content-monetization', 'tip-post', [
        types.uint(1),
        types.uint(100)
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Check post tips
    let result = chain.callReadOnlyFn('content-monetization', 'get-post-tips', [types.uint(1)], deployer.address);
    assertEquals(result.result.expectSome().expectTuple()['total-tips'], types.uint(100));
    
    // Check token balance
    result = chain.callReadOnlyFn('content-monetization', 'get-token-balance', [types.principal(wallet2.address)], deployer.address);
    assertEquals(result.result, types.uint(100));
  },
});
