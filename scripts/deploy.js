const { execSync } = require('child_process');

const target = process.argv[2] || 'both'; // hosting, functions, or both

if (!['hosting', 'functions', 'both'].includes(target)) {
  console.error('Usage: npm run deploy [hosting|functions|both]');
  process.exit(1);
}

try {
  // Build step
  if (target === 'both' || target === 'hosting') {
    console.log('Building hosting...');
    execSync('cd hosting && npm run build', { stdio: 'inherit' });
  }

  if (target === 'both' || target === 'functions') {
    console.log('Building functions...');
    execSync('cd functions && npm run build', { stdio: 'inherit' });
  }

  // Deploy step
  console.log('\nDeploying...');
  const deployTarget = target === 'both' ? '' : `--only ${target}`;
  execSync(`firebase deploy ${deployTarget}`, { stdio: 'inherit' });

  // Tag current commit
  console.log('\nTagging commit...');
  const tags = [];
  if (target === 'both' || target === 'hosting') {
    execSync('git tag -f deployed/hosting HEAD');
    tags.push('deployed/hosting');
  }
  if (target === 'both' || target === 'functions') {
    execSync('git tag -f deployed/functions HEAD');
    tags.push('deployed/functions');
  }
  console.log(`✓ Tagged HEAD as: ${tags.join(', ')}`);
} catch (error) {
  console.error('\n✗ Deploy failed');
  process.exit(1);
}
