import BasePage from './base-page';

class Blog extends BasePage {
    onReady() {
        this.initToggleLike();
    }

    initToggleLike() {
        const likeBtn = document.querySelector('#blog-like');

        if (!likeBtn || !salla.url.is_page('blog.single')) {
            return;
        }

        const blogId = likeBtn.dataset.blogId;
        const likedBlogs = JSON.parse(localStorage.getItem('liked_blogs')) || [];
        this.isLiked = likedBlogs.includes(blogId);

        if (this.isLiked) {
            likeBtn.classList.add('liked');
        }

        likeBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            if (salla.config.isGuest()) {
                return salla.notify.error(salla.lang.get('common.messages.must_login'));
            }

            const originalContent = likeBtn.innerHTML;
            likeBtn.querySelector('i').outerHTML = '<span class="loader loader--small"></span>';

            const endpoint = this.isLiked ? `blogs/${blogId}/unlike` : `blogs/${blogId}/like`;
            try {
                await salla.api.request(endpoint, '', this.isLiked ? 'delete' : 'put');
                likeBtn.innerHTML = originalContent;
                this.updateLikedBlogs(blogId, !this.isLiked);
                this.updateLikesCount(!this.isLiked);
                this.isLiked = !this.isLiked;
            } catch (e) {
                 likeBtn.innerHTML = originalContent;
                if (e.response?.status === 409) {
                    this.handleExistingLike(likeBtn, blogId);
                }
            }
        });
    }

    handleExistingLike(likeBtn, blogId) {
        const isLiked = likeBtn.classList.contains('liked');
        this.updateLikedBlogs(blogId, !isLiked);
        this.updateLikesCount(!isLiked);
        this.isLiked = !isLiked; 
    }

    updateLikedBlogs(blogId, add) {
        const likedBlogs = JSON.parse(localStorage.getItem('liked_blogs')) || [];
        const updatedBlogs = add ? [...likedBlogs, blogId] : likedBlogs.filter(id => id !== blogId);
        localStorage.setItem('liked_blogs', JSON.stringify(updatedBlogs));
    }

    updateLikesCount(isLiked) {
        const likeButton = document.querySelector('#blog-like');
        const countSpan = likeButton.querySelector('span');
        const currentCount = parseInt(countSpan?.innerText) || 0;

        likeButton.classList.toggle("liked", isLiked);

        // HDL-06 (T018): native, synchronous state — the count is correct the
        // moment the request resolves, and Salla still owns success/failure.
        // Feedback is optional, bounded, and goes through the shared motion
        // controller so the live reduced-motion state always wins.
        countSpan.textContent = String(isLiked ? currentCount + 1 : currentCount - 1);
        window.hadeelMotion?.feedback(countSpan);
    }
}

Blog.initiateWhenReady(['blog.single', 'blog.index']);
