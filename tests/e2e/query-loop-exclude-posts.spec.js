import { test, expect } from '@wordpress/e2e-test-utils-playwright';

const postTitles = [
	'Post One',
	'Exclude me',
	'Post Three',
];

const iframeSelector = 'iframe[name="editor-canvas"]';
const getEditorFrame = (page) => page.frameLocator(iframeSelector);

// Helper to insert query loop block with default pattern
async function insertQueryLoopBlock(page, editor) {
	await editor.insertBlock({ name: 'core/query' });
	await getEditorFrame(page).getByRole('button', { name: 'Choose' }).click();
	await page.locator('.block-editor-block-preview__container').first().click();
}


test.describe('Query Loop Exclude Posts Block', () => {
	let testPost;
	// One-time setup: Activate plugin
	test.beforeAll(async ({ requestUtils }) => {
		await requestUtils.activatePlugin('query-loop-exclude-posts');
		await requestUtils.activateTheme('twentytwentyfive');
	});

	// Per-test: Create posts and open new post for testing
	test.beforeEach(async ({ admin, editor, requestUtils, page }) => {
		// Create the source posts
		for (const title of postTitles) {
			await admin.createNewPost({ title });
			await editor.publishPost();
		}

		// Create the test post
		testPost = await requestUtils.createPost({ 
			title: 	'Query Loop Exclude Test',
			content: `<!-- wp:query {"queryId":9,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false},"metadata":{"categories":["posts"],"patternName":"core/query-standard-posts","name":"Standard"}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title {"isLink":true} /-->
<!-- /wp:post-template --></div>
<!-- /wp:query -->`,
			status: 'publish'
		});
		await admin.editPost( testPost.id );
		// Wait for the block to be rendered
		const editorFrame = getEditorFrame(page);

		// Wait for the block to appear inside the iframe
		await editorFrame.locator('.wp-block-query').waitFor();

		// Click on the block inside the iframe
		await editorFrame.locator('.wp-block-query').click();

		// Verify the block is selected (this part is still outside the iframe)
		await expect(page.locator('.block-editor-block-toolbar')).toBeVisible();
		await page.locator('.block-editor-block-parent-selector__button').click();
		//await insertQueryLoopBlock(editor.page, editor); // Use editor.page instead of standalone `page`
	});

	// Cleanup
	test.afterEach(async ({ requestUtils }) => {
		await requestUtils.deleteAllPosts( requestUtils );
	});	

	// Tests
	test('displays custom exclusion controls in the block sidebar', async ({ page }) => {
		await expect(page.getByLabel('Exclude by Title')).toBeVisible();
		await expect(page.locator('div').filter({ hasText: /^Exclude current post$/ }).first()).toBeVisible();
	});

	test('shows all 4 posts in query loop editor preview', async ({ page, editor }) => {
		const frame = getEditorFrame(page);
		const queryLoopBlock = frame.locator('.wp-block-query > ul');
		for (const title of postTitles) {
			await expect(queryLoopBlock.getByText(title).first()).toBeVisible();
		}
		await expect(queryLoopBlock.getByText('Query Loop Exclude Test').first()).toBeVisible();
	});

});
