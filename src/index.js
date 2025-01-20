import { addFilter } from '@wordpress/hooks';
import { Fragment, useEffect } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow, FormTokenField, FormToggle } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Add a custom attribute to the core/query block.
 */
const addExcludeCurrentAttribute = (settings, name) => {
    if (name !== 'core/query') {
        return settings;
    }

    // Add the `excludeCurrent` attribute
    settings.attributes = {
        ...settings.attributes,
        excludeCurrent: {
            type: 'boolean',
            default: false, // Default to not excluding the current post
        },
    };

    return settings;
};

addFilter(
    'blocks.registerBlockType',
    'query-loop-exclude-posts/add-exclude-current-attribute',
    addExcludeCurrentAttribute
);

/**
 * Extend the Query Loop Block filters panel.
 */
const withExcludePostsControl = createHigherOrderComponent( ( BlockEdit ) => {
    return ( props ) => {
        if ( props.name !== 'core/query' ) {
            return <BlockEdit { ...props } />;
        }

        const { setAttributes, attributes } = props;
        const { query = {}, excludeCurrent = false } = attributes;
        const exclude = query.exclude || [];
        const postType = query.postType || 'post';

        const updateQueryExclude = ( newExclude ) => {
            setAttributes( {
                query: {
                    ...query,
                    exclude: newExclude,
                },
            } );
        };

        // Add or remove current post ID based on excludeCurrent
        useEffect(() => {
            const currentPostId = wp.data.select('core/editor').getCurrentPostId();
            console.log(currentPostId);

            if (excludeCurrent && currentPostId && Number.isInteger(currentPostId)) {
                // Add current post ID if it's not already in the list
                if (!exclude.includes(currentPostId)) {
                    updateQueryExclude([...exclude, currentPostId]);
                }
            } else if (currentPostId && Number.isInteger(currentPostId) && exclude.includes(currentPostId)) {
                // Remove current post ID if it's included in the exclude list
                updateQueryExclude(exclude.filter((id) => id !== currentPostId));
            }
        }, [excludeCurrent, exclude, updateQueryExclude]);

        function setExcludeCurrent(){
            setAttributes( { excludeCurrent: !excludeCurrent } );
        }
        
        return (
            <Fragment>
                <BlockEdit { ...props } />
                <InspectorControls>
                    <PanelBody 
                        title={ sprintf(
                            /* Translators: %s is the post type name */
                            __('Exclude %ss', 'query-loop-exclude-posts'),
                            postType.charAt(0).toUpperCase() + postType.slice(1) // Capitalize the post type
                        ) }
                        initialOpen={ true }>
                        <PanelRow>
                            <PostSelector
                                excludePosts={ exclude }
                                postType={ postType }
                                onChange={ updateQueryExclude }
                            />
                        </PanelRow>
                        <PanelRow>
                            <div>
                                <label>
                                    {sprintf(
                                        __('Exclude current %s', 'query-loop-exclude-posts'),
                                        postType
                                    )}  
                                </label>
                            </div>
                            <FormToggle
                                label={sprintf(
                                    __('Exclude current %s', 'query-loop-exclude-posts'),
                                    postType
                                )}
                                checked={excludeCurrent}
                                onChange={ () => setExcludeCurrent() }
                            />
                        </PanelRow>
                    </PanelBody>
                </InspectorControls>
            </Fragment>
        );
    };
}, 'withExcludePostsControl' );

addFilter(
    'editor.BlockEdit',
    'query-loop-exclude-posts/with-exclude-posts-control',
    withExcludePostsControl
);

/**
 * Component for selecting posts to exclude.
 */
const PostSelector = withSelect( ( select, ownProps ) => {
    const { postType } = ownProps;
    const { getEntityRecords } = select( 'core' );
    const posts = getEntityRecords( 'postType', postType, { per_page: -1 } );
    return { posts };
} )( ( { posts, excludePosts, onChange } ) => {
    const postTitles = posts
        ? posts.map( ( post ) => ( { id: post.id, title: post.title.rendered } ) )
        : [];

    const selectedTitles = postTitles
        .filter( ( post ) => excludePosts.includes( post.id ) )
        .map( ( post ) => post.title );

    return (
        <FormTokenField
            label={ __( 'Exclude by Title', 'query-loop-exclude-posts' ) }
            value={ selectedTitles }
            suggestions={ postTitles.map( ( post ) => post.title ) }
            onChange={ ( selected ) => {
                const selectedIds = postTitles
                    .filter( ( post ) => selected.includes( post.title ) )
                    .map( ( post ) => post.id );
                onChange( selectedIds );
            } }
            __nextHasNoMarginBottom={true}
            __experimentalShowHowTo={false}
        />
    );
} );
