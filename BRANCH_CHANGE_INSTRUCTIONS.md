# Git Branch Change Instructions

## Change to research-subdirectory Branch

Since Git is not available in the WebContainer environment, please run these commands in your local development environment:

### Option 1: If the branch already exists remotely
```bash
# Fetch all remote branches
git fetch origin

# Switch to the research-subdirectory branch
git checkout research-subdirectory

# Pull latest changes
git pull origin research-subdirectory
```

### Option 2: If you need to create a new branch
```bash
# Create and switch to new branch
git checkout -b research-subdirectory

# Push the new branch to remote
git push -u origin research-subdirectory
```

### Option 3: If the branch exists locally but not tracking remote
```bash
# Switch to the branch
git checkout research-subdirectory

# Set upstream tracking
git push -u origin research-subdirectory
```

## Verify Current Branch
```bash
# Check current branch
git branch

# Check remote branches
git branch -r

# Check branch status
git status
```

## After Branch Change
Once you've changed to the research-subdirectory branch in your local environment, you can continue development with the Docker configuration that's already set up for subdirectory deployment.

The current configuration already supports subdirectory deployment with:
- Base path: `/cms/`
- Nginx configuration for subdirectory routing
- Environment variables for subdirectory setup
- Docker compose for production subdirectory deployment

## Next Steps
1. Run the git commands above in your local terminal
2. Verify you're on the correct branch
3. Continue with Docker development or deployment as needed