class TemplateManager {
    constructor() {
        this.searchInput = document.querySelector('.templates-search input');
        this.templatesList = document.querySelector('.templates-list');
        this.resizeObserver = new ResizeObserver(() => this.calculateListHeight());
        this.initializeSearch();
        this.templates = [
            {
                id: 'blog-post',
                name: 'Blog Post',
                icon: 'fas fa-blog',
                description: 'Structured article template with clear sections and writing prompts',
                content: {
                    ops: [
                        { insert: 'Catchy Blog Post Title\n', attributes: { header: 1 } },
                        { insert: 'Introduction\n', attributes: { header: 2 } },
                        { insert: '[Hook: Start with a surprising statistic, question, or anecdote]\n', attributes: { italic: true } },
                        { insert: 'Clearly state what this post will cover and why it matters...\n\n' },
                        { insert: 'Main Content Sections\n', attributes: { header: 2 } },
                        { insert: '1. Key Point 1\n', attributes: { header: 3 } },
                        { insert: '• Explain the concept\n• Provide examples\n• Add supporting data\n\n', attributes: { italic: true } },
                        { insert: '2. Key Point 2\n', attributes: { header: 3 } },
                        { insert: '• Use analogies\n• Include relevant quotes\n• Share personal experiences\n\n', attributes: { italic: true } },
                        { insert: 'Practical Applications\n', attributes: { header: 2 } },
                        { insert: 'Step-by-step guide for implementing what you\'ve taught:\n1. \n2. \n3. \n\n' },
                        { insert: 'Conclusion\n', attributes: { header: 2 } },
                        { insert: 'Restate your main thesis\nCall to action: What should readers do next?\n', attributes: { italic: true } }
                    ]
                }
            },
            {
                id: 'tutorial',
                name: 'Tutorial',
                icon: 'fas fa-graduation-cap',
                description: 'Step-by-step instructional guide with interactive elements',
                content: {
                    ops: [
                        { insert: 'How to [Task Name]\n', attributes: { header: 1 } },
                        { insert: 'Prerequisites\n', attributes: { header: 2 } },
                        { insert: '• Required software/tools\n• Necessary skills\n• Recommended resources\n\n' },
                        { insert: 'Step 1: Preparation\n', attributes: { header: 2 } },
                        { insert: 'Explain what needs to be set up first\n', attributes: { italic: true } },
                        { insert: 'Code Example:\n', attributes: { header: 3 } },
                        { insert: '# Initialize project\nnpm init -y\n', attributes: { 'code-block': true } },
                        { insert: '\nStep 2: Implementation\n', attributes: { header: 2 } },
                        { insert: 'Break down complex processes into numbered substeps\n', attributes: { italic: true } },
                        { insert: 'Troubleshooting Tips\n', attributes: { header: 2 } },
                        { insert: '• Common errors to avoid\n• Debugging techniques\n• Helpful resources\n\n' }
                    ]
                }
            },
            {
                id: 'review',
                name: 'Product Review',
                icon: 'fas fa-star',
                description: 'Detailed product review template',
                content: {
                    ops: [
                        { insert: 'Product Name - Comprehensive Review\n', attributes: { header: 1 } },
                        { insert: 'Quick Overview\n', attributes: { header: 2 } },
                        { insert: 'Brief introduction to the product...\n\n' },
                        { insert: 'Pros:\n', attributes: { header: 3 } },
                        { insert: '✓ First advantage\n✓ Second advantage\n✓ Third advantage\n\n' },
                        { insert: 'Cons:\n', attributes: { header: 3 } },
                        { insert: '✗ First disadvantage\n✗ Second disadvantage\n\n' },
                        { insert: 'Detailed Review\n', attributes: { header: 2 } },
                        { insert: 'In-depth analysis of features...\n\n' },
                        { insert: 'Final Verdict\n', attributes: { header: 2 } },
                        { insert: 'Summary and rating...\n' }
                    ]
                }
            },
            {
                id: 'news',
                name: 'News Article',
                icon: 'fas fa-newspaper',
                description: 'Professional news article format',
                content: {
                    ops: [
                        { insert: 'Breaking News Title\n', attributes: { header: 1 } },
                        { insert: 'Subtitle or Brief Summary\n', attributes: { header: 2 } },
                        { insert: 'Lead paragraph with the most important information...\n\n' },
                        { insert: 'Background\n', attributes: { header: 2 } },
                        { insert: 'Provide context and history...\n\n' },
                        { insert: 'Key Details\n', attributes: { header: 2 } },
                        { insert: 'Expand on the main story...\n\n' },
                        { insert: 'Expert Opinions\n', attributes: { header: 2 } },
                        { insert: 'Include quotes and analysis...\n\n' },
                        { insert: 'What\'s Next\n', attributes: { header: 2 } },
                        { insert: 'Future implications and next steps...\n' }
                    ]
                }
            },
            {
                id: 'comparison',
                name: 'Product Comparison',
                icon: 'fas fa-balance-scale',
                description: 'Detailed feature-by-feature analysis of competing solutions',
                content: {
                    ops: [
                        { insert: '[Product A] vs [Product B]: Comprehensive Comparison\n', attributes: { header: 1 } },
                        { insert: 'Comparison Criteria\n', attributes: { header: 2 } },
                        { insert: '• Define evaluation metrics\n• Explain selection methodology\n\n' },
                        { insert: 'Feature Analysis\n', attributes: { header: 2 } },
                        { insert: '1. Core Functionality\n', attributes: { header: 3 } },
                        { insert: '[Product A]: Strengths/Weaknesses\n[Product B]: Strengths/Weaknesses\n\n' },
                        { insert: '2. User Experience\n', attributes: { header: 3 } },
                        { insert: 'Interface comparison\nLearning curve analysis\n\n' },
                        { insert: 'Pricing Breakdown\n', attributes: { header: 2 } },
                        { insert: '• Subscription models\n• Hidden costs\n• ROI comparison\n\n' },
                        { insert: 'Final Recommendation\n', attributes: { header: 2 } },
                        { insert: 'Best for [use case]: [Product]\nBest for [other use case]: [Product]\n' }
                    ]
                }
            },
            {
                id: 'case-study',
                name: 'Case Study',
                icon: 'fas fa-microscope',
                description: 'Detailed analysis of real-world business scenarios',
                content: {
                    ops: [
                        { insert: 'Case Study: [Company/Project Name]\n', attributes: { header: 1 } },
                        { insert: 'Executive Summary\n', attributes: { header: 2 } },
                        { insert: 'Brief overview (1-2 paragraphs) highlighting key outcomes\n\n' },
                        { insert: 'Challenge\n', attributes: { header: 2 } },
                        { insert: '• Specific problem faced\n• Business impact\n• Stakeholders involved\n\n' },
                        { insert: 'Solution\n', attributes: { header: 2 } },
                        { insert: '• Chosen approach\n• Implementation timeline\n• Key decision factors\n\n' },
                        { insert: 'Results\n', attributes: { header: 2 } },
                        { insert: 'Quantifiable outcomes:\n• Metric 1: Before → After\n• Metric 2: Improvement %\n\n' },
                        { insert: 'Lessons Learned\n', attributes: { header: 2 } },
                        { insert: 'What would you do differently? What worked exceptionally well?\n' }
                    ]
                }
            },
            {
                id: 'research',
                name: 'Research Article',
                icon: 'fas fa-flask',
                description: 'Academic research article template',
                content: {
                    ops: [
                        { insert: 'Research Title\n', attributes: { header: 1 } },
                        { insert: 'Abstract\n', attributes: { header: 2 } },
                        { insert: 'Brief summary of the research...\n\n' },
                        { insert: 'Introduction\n', attributes: { header: 2 } },
                        { insert: 'Background and research objectives...\n\n' },
                        { insert: 'Methodology\n', attributes: { header: 2 } },
                        { insert: 'Research methods and procedures...\n\n' },
                        { insert: 'Results\n', attributes: { header: 2 } },
                        { insert: 'Findings and data analysis...\n\n' },
                        { insert: 'Discussion\n', attributes: { header: 2 } },
                        { insert: 'Interpretation of results...\n\n' },
                        { insert: 'Conclusion\n', attributes: { header: 2 } },
                        { insert: 'Summary of findings and implications...\n' }
                    ]
                }
            },
            {
                id: 'newsletter',
                name: 'Newsletter',
                icon: 'fas fa-envelope',
                description: 'Engaging email newsletter template with multiple content sections',
                content: {
                    ops: [
                        { insert: 'Monthly Update: [Month] [Year]\n', attributes: { header: 1 } },
                        { insert: 'Featured Article\n', attributes: { header: 2 } },
                        { insert: '• Compelling headline\n• 2-3 sentence teaser\n• "Read more" link\n\n' },
                        { insert: 'Quick Updates\n', attributes: { header: 2 } },
                        { insert: '• Company news\n• Event reminders\n• Product updates\n\n' },
                        { insert: 'Resource Spotlight\n', attributes: { header: 2 } },
                        { insert: '• Helpful guide/tool\n• Brief description\n• Access instructions\n\n' },
                        { insert: 'Upcoming Events\n', attributes: { header: 2 } },
                        { insert: '• Date/Time\n• Location/Platform\n• Registration details\n\n' },
                        { insert: 'CTA Section\n', attributes: { header: 2 } },
                        { insert: 'Clear action you want readers to take:\n• Button/Link\n• Deadline (if applicable)\n' }
                    ]
                }
            },
            {
                id: 'ultimate-guide',
                name: 'Ultimate Guide',
                icon: 'fas fa-book-open',
                description: 'Comprehensive resource for mastering a topic',
                content: {
                    ops: [
                        { insert: 'The Complete Guide to [Topic]\n', attributes: { header: 1 } },
                        { insert: 'Why This Matters\n', attributes: { header: 2 } },
                        { insert: 'Establish authority and show relevance...\n\n' },
                        { insert: 'Fundamentals\n', attributes: { header: 2 } },
                        { insert: '• Core concepts\n• Key terminology\n• Basic principles\n\n' },
                        { insert: 'Advanced Techniques\n', attributes: { header: 2 } },
                        { insert: '• Pro tips\n• Workarounds\n• Expert strategies\n\n' },
                        { insert: 'Tools & Resources\n', attributes: { header: 2 } },
                        { insert: '• Recommended software\n• Helpful websites\n• Essential reading\n\n' }
                    ]
                }
            },
            {
                id: 'faq',
                name: 'FAQ Post',
                icon: 'fas fa-question-circle',
                description: 'Answer common questions in structured format',
                content: {
                    ops: [
                        { insert: 'Frequently Asked Questions About [Topic]\n', attributes: { header: 1 } },
                        { insert: 'Introduction to Common Questions\n', attributes: { header: 2 } },
                        { insert: 'Q: [Common question 1]\n', attributes: { header: 3 } },
                        { insert: 'A: Provide concise answer...\n\n' },
                        { insert: 'Q: [Common question 2]\n', attributes: { header: 3 } },
                        { insert: 'A: Include supporting evidence...\n\n' },
                        { insert: 'Bonus: Uncommon Questions\n', attributes: { header: 2 } },
                        { insert: 'Address niche concerns...\n' }
                    ]
                }
            },
            {
                id: 'product-launch',
                name: 'Product Launch',
                icon: 'fas fa-rocket',
                description: 'Announce and showcase new products/features',
                content: {
                    ops: [
                        { insert: 'Introducing [Product Name]!\n', attributes: { header: 1 } },
                        { insert: 'The Problem We Solve\n', attributes: { header: 2 } },
                        { insert: 'Paint the pain points...\n\n' },
                        { insert: 'Key Features\n', attributes: { header: 2 } },
                        { insert: '• Benefit-driven feature 1\n• Unique capability 2\n• Differentiator 3\n\n' },
                        { insert: 'Getting Started\n', attributes: { header: 2 } },
                        { insert: 'Simple onboarding steps:\n1. \n2. \n3. \n\n' },
                        { insert: 'Launch Special\n', attributes: { header: 2 } },
                        { insert: 'Limited-time offer details...\n' }
                    ]
                }
            },
            {
                id: 'listicle',
                name: 'Listicle',
                icon: 'fas fa-list-ol',
                description: 'Numbered list format for scannable content',
                content: {
                    ops: [
                        { insert: '7 Essential [Topic] Tips You Need to Know\n', attributes: { header: 1 } },
                        { insert: 'Why This List Matters\n', attributes: { header: 2 } },
                        { insert: '1. Tip 1\n', attributes: { header: 3 } },
                        { insert: 'Explanation and examples...\n\n' },
                        { insert: '2. Tip 2\n', attributes: { header: 3 } },
                        { insert: 'Actionable advice...\n\n' },
                        { insert: 'Pro Bonus Tip\n', attributes: { header: 2 } },
                        { insert: 'Advanced strategy for power users...\n' }
                    ]
                }
            },
            {
                id: 'resource-roundup',
                name: 'Resource Roundup',
                icon: 'fas fa-box-open',
                description: 'Curated collection of tools and resources',
                content: {
                    ops: [
                        { insert: 'Best [Category] Resources for [Audience]\n', attributes: { header: 1 } },
                        { insert: 'Selection Criteria\n', attributes: { header: 2 } },
                        { insert: '• Price\n• Ease of use\n• Unique features\n\n' },
                        { insert: 'Top 5 Tools\n', attributes: { header: 2 } },
                        { insert: '1. [Tool Name]\n• Pros\n• Cons\n• Best for...\n\n' },
                        { insert: 'Honorable Mentions\n', attributes: { header: 2 } },
                        { insert: '• Niche solutions\n• Emerging options\n\n' }
                    ]
                }
            },
            {
                id: 'interview',
                name: 'Interview',
                icon: 'fas fa-comments',
                description: 'Q&A format with expert insights',
                content: {
                    ops: [
                        { insert: 'Expert Insights: [Topic] with [Name]\n', attributes: { header: 1 } },
                        { insert: 'Introduction to Interviewee\n', attributes: { header: 2 } },
                        { insert: 'Q: [Opening question]\n', attributes: { header: 3 } },
                        { insert: 'A: [Detailed response]\n\n' },
                        { insert: 'Q: [Follow-up question]\n', attributes: { header: 3 } },
                        { insert: 'A: [Actionable advice]\n\n' },
                        { insert: 'Key Takeaways\n', attributes: { header: 2 } },
                        { insert: '• Summary point 1\n• Summary point 2\n' }
                    ]
                }
            },
            {
                id: 'troubleshooting',
                name: 'Troubleshooting',
                icon: 'fas fa-bug',
                description: 'Error-focused guide with solutions',
                content: {
                    ops: [
                        { insert: 'Fix Common [System] Errors\n', attributes: { header: 1 } },
                        { insert: 'Symptom: [Error message/behavior]\n', attributes: { header: 2 } },
                        { insert: '1. Quick Fix\n• Step-by-step solution\n\n' },
                        { insert: '2. Advanced Repair\n• Technical instructions\n\n' },
                        { insert: 'Prevention Tips\n', attributes: { header: 2 } },
                        { insert: '• Maintenance routines\n• Monitoring tools\n' }
                    ]
                }
            },
            {
                id: 'year-review',
                name: 'Year-in-Review',
                icon: 'fas fa-calendar-alt',
                description: 'Annual summary with metrics and lessons',
                content: {
                    ops: [
                        { insert: '[Year] Year in Review: Key Lessons Learned\n', attributes: { header: 1 } },
                        { insert: 'Major Achievements\n', attributes: { header: 2 } },
                        { insert: '• Metric 1 growth\n• Completed projects\n\n' },
                        { insert: 'Unexpected Challenges\n', attributes: { header: 2 } },
                        { insert: '• Obstacle 1\n• How we overcame it\n\n' },
                        { insert: 'Goals for Next Year\n', attributes: { header: 2 } },
                        { insert: '• Objective 1\n• Key initiatives\n' }
                    ]
                }
            },
            {
                id: 'guest-post',
                name: 'Guest Post',
                icon: 'fas fa-pen-fancy',
                description: 'Template for submitting articles to other blogs',
                content: {
                    ops: [
                        { insert: '[Target Audience] Guide to [Topic]\n', attributes: { header: 1 } },
                        { insert: 'Hook: Immediate value proposition\n', attributes: { header: 2 } },
                        { insert: 'Unique angle or perspective...\n\n' },
                        { insert: 'Actionable Advice Section\n', attributes: { header: 2 } },
                        { insert: 'Step 1: \nStep 2: \nStep 3: \n\n' },
                        { insert: 'Bio & Call-to-Action\n', attributes: { header: 2 } },
                        { insert: 'Brief author bio with credentials...\n' }
                    ]
                }
            },
            {
                id: 'show-notes',
                name: 'Show Notes',
                icon: 'fas fa-podcast',
                description: 'Multimedia companion content',
                content: {
                    ops: [
                        { insert: '[Episode Title] Show Notes\n', attributes: { header: 1 } },
                        { insert: 'Episode Summary\n', attributes: { header: 2 } },
                        { insert: 'Key discussion points...\n\n' },
                        { insert: 'Timestamps\n', attributes: { header: 2 } },
                        { insert: '00:00 - Introduction\n10:00 - Main topic\n\n' },
                        { insert: 'Resources Mentioned\n', attributes: { header: 2 } },
                        { insert: '• Book 1\n• Tool 2\n• Article 3\n' }
                    ]
                }
            },
            {
                id: 'personal-story',
                name: 'Personal Story',
                icon: 'fas fa-heart',
                description: 'Narrative structure with emotional arc',
                content: {
                    ops: [
                        { insert: 'How I [Achievement]: A Personal Journey\n', attributes: { header: 1 } },
                        { insert: 'The Beginning\n', attributes: { header: 2 } },
                        { insert: 'Set the scene and initial challenges...\n\n' },
                        { insert: 'Turning Point\n', attributes: { header: 2 } },
                        { insert: 'Key moment of change...\n\n' },
                        { insert: 'Lessons Learned\n', attributes: { header: 2 } },
                        { insert: '• Personal growth\n• Practical advice\n' }
                    ]
                }
            }
        ];

        this.initializeTemplates();
    }

    initializeTemplates() {
        this.templatesList.innerHTML = this.templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-icon">
                    <i class="${template.icon}"></i>
                </div>
                <div class="template-info">
                    <h3>${template.name}</h3>
                    <p>${template.description}</p>
                </div>
            </div>
        `).join('');

        this.setupEventListeners();

        // Start observing and calculate initial height
        const container = document.querySelector('.template-options');
        if (container) {
            this.resizeObserver.observe(container);
            this.calculateListHeight();
        }
    }

    calculateListHeight() {
        const list = document.querySelector('.templates-list');
        if (!list) return;

        // Get heights of all fixed elements above the list
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const tabsHeight = document.querySelector('.tabs')?.offsetHeight || 0;
        const searchHeight = document.querySelector('.templates-search')?.offsetHeight || 0;

        // Calculate available height
        const viewportHeight = window.innerHeight;
        const margins = 32; // Total vertical margins/padding
        const bottomPadding = 42; // Match the CSS padding-bottom
        const maxHeight = viewportHeight - headerHeight - tabsHeight - searchHeight - margins - bottomPadding;

        // Apply calculated height
        list.style.maxHeight = `${Math.max(maxHeight, 200)}px`; // Minimum 200px height
    }

    setupEventListeners() {
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                const template = this.templates.find(t => t.id === templateId);
                if (template && window.editor?.quill) {
                    window.editor.quill.setContents(template.content);
                    // Show success toast
                    if (window.showToast) {
                        window.showToast('Template applied successfully!', 'success');
                    }
                }
            });
        });

        // Add window resize listener
        window.addEventListener('resize', () => this.calculateListHeight());
    }

    initializeSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const allCards = this.templatesList.querySelectorAll('.template-card');

            allCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
                card.style.display = isVisible ? 'flex' : 'none';
            });
        });
    }
} 