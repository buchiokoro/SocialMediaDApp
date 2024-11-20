import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that users can create, update, and delete posts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Create a post
    let block = chain.mineBlock([
      Tx.contractCall('content-storage', 'create-post', [
        types.utf8("Hello, Stacks!"),
        types.ascii("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco")
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
    
    // Update the post
    block = chain.mineBlock([
      Tx.contractCall('content-storage', 'update-post', [
        types.uint(1),
        types.utf8("Updated: Hello, Stacks!"),
        types.ascii("QmNewHash")
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Try to update someone else's post (should fail)
    block = chain.mineBlock([
      Tx.contractCall('content-storage', 'update-post', [
        types.uint(1),
        types.utf8("Unauthorized update"),
        types.ascii("QmUnauthorizedHash")
      ], wallet2.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u102)');
    
    // Delete the post
    block = chain.mineBlock([
      Tx.contractCall('content-storage', 'delete-post', [types.uint(1)], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify the post is deleted
    let result = chain.callReadOnlyFn('content-storage', 'get-post', [types.uint(1)], wallet1.address);
    assertEquals(result.result, 'none');
  },
});
