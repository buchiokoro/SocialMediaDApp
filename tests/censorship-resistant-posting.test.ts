;; tests/censorship-resistant-posting_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that posts can be flagged and resolved",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Create a post
    let block = chain.mineBlock([
      Tx.contractCall('content-storage', 'create-post', [
        types.utf8("Potentially controversial post"),
        types.ascii("QmControversialHash")
      ], wallet1.address)
    ]);
    
    // Flag the post
    block = chain.mineBlock([
      Tx.contractCall('censorship-resistant-posting', 'flag-post', [
        types.uint(1),
        types.utf8("Inappropriate content")
      ], wallet2.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Check flag status
    let result = chain.callReadOnlyFn('censorship-resistant-posting', 'get-post-flag', [types.uint(1)], deployer.address);
    assertEquals(result.result.expectSome().expectTuple()['flagged'], types.bool(true));
    
    // Resolve flag (keep post visible)
    block = chain.mineBlock([
      Tx.contractCall('censorship-resistant-posting', 'resolve-flag', [
        types.uint(1),
        types.bool(true)
      ], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Check user reputation
    result = chain.callReadOnlyFn('censorship-resistant-posting', 'get-user-reputation', [types.principal(wallet1.address)], deployer.address);
    assertEquals(result.result.expectTuple()['score'], types.int(1));
  },
});
