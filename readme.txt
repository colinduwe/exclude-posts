=== Query Loop Exclude Posts ===
Contributors: ColinD
Tags: Query Loop Block
Tested up to: 6.7.1
Stable tag: 1.1.1
Requires at least: 6.6
Requires PHP: 8.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Extends the Query Loop Block to allow excluding specific posts. 

=== Description ===

Extends the Query Loop Block to allow excluding specific posts. 

1. Provides controls in the Query Loop Block Select specific posts by title.
2. Provides a toggle to exclude the current post.

Works with whichever post type is set for the query loop Block (Post, Page, etc)

"Exclude Current Post" is helpful for "related posts" patterns often used on a single
post template. Using this option on the query loop block will let it pull in posts but 
not the single post currently being viewed.

=== Development and Support ===
wp
This plugin is developed on Github. You can find the uncompressed source javascript and
submit issues and pull requests there:
https://github.com/colinduwe/exclude-posts

If you've checked out the full source code either from my repo or your own fork you'll 
want to do the following in your terminal:
1. Navigate within this plugin's directory.
2. Install the development dependencies by running 'npm install'
3. Work on the plugin code by running 'npm start'
4. Complete your work by building for production by running 'npm run build'

== Screenshots ==

1. The controls are added to the query loop block's settings sidebar.

== Changelog ==

= 1.1.1 =
* Added unit and e2e tests

= 1.1.0 =
* Fixed bug when used in the Site Editor where the exclude current post toggle
would cause an error resulting in an endlessly spinning loading wheel in the
query loop.

= 1.0.0 = 
*initial release