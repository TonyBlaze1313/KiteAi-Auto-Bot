const fs = require('fs/promises');
const axios = require('axios');
const { createAgent } = require('https-proxy-agent');
const chalk = require('chalk');
const colorama = require('colorama');
const names = require('names');
const randomUseragent = require('random-useragent');
const { v4: uuidv4 } = require('uuid');

colorama.init();

const logMessage = (message, color = 'white') => {
  console.log(chalk[color](message));
};

const waitForKeyPress = async () => {
  process.stdin.setRawMode(true);
  return new Promise((resolve) => {
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      resolve();
    });
  });
};

const loadWallets = async () => {
  try {
    const data = await fs.readFile('wallets.txt', 'utf8');
    const wallets = data
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
    if (wallets.length === 0) {
      throw new Error('No wallets found in wallets.txt');
    }
    return wallets;
  } catch (error) {
    logMessage(`Error reading wallets.txt: ${error.message}`, 'red');
    process.exit(1);
  }
};

const loadProxies = async () => {
  try {
    const data = await fs.readFile('proxies.txt', 'utf8');
    return data
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((proxy) => {
        const [protocol, host, port, auth] = proxy.split(':');
        return { protocol, host, port, auth };
      });
  } catch (error) {
    logMessage('No proxies.txt found or error reading file. Using direct connection.', 'yellow');
    return [];
  }
};

const createAgent = (proxy) => {
  if (!proxy) return null;
  const { protocol, host, port, auth } = proxy;
  const authString = auth ? `${auth}@` : '';
  const proxyUrl = `${protocol}://${authString}${host}:${port}`;
  return createAgent(proxyUrl);
};

const AI_ENDPOINTS = {
  'https://deployment-uu9y1z4z85rapgwkss1muuiz.stag-vxzy.zettablock.com/main': {
    agent_id: 'deployment_UU9y1Z4Z85RAPGwkss1mUUiZ',
    name: 'Kite AI Assistant',
    questions: [
      'Tell me about the latest updates in Kite AI',
      'What are the upcoming features in Kite AI?',
      'How can Kite AI improve my development workflow?',
      'What makes Kite AI unique in the market?',
      'How does Kite AI handle code completion?',
      'Can you explain Kite AI\'s machine learning capabilities?',
      'What programming languages does Kite AI support best?',
      'How does Kite AI integrate with different IDEs?',
      'What are the advanced features of Kite AI?',
      'How can I optimize my use of Kite AI?',
    ],
  },
  'https://deployment-ecz5o55dh0dbqagkut47kzyc.stag-vxzy.zettablock.com/main': {
    agent_id: 'deployment_ECz5O55dH0dBQaGKuT47kzYC',
    name: 'Crypto Price Assistant',
    questions: [
      'What\'s the current market sentiment for Solana?',
      'Analyze Bitcoin\'s price movement in the last hour',
      'Compare ETH and BTC performance today',
      'Which altcoins are showing bullish patterns?',
      'Market analysis for top 10 cryptocurrencies',
      'Technical analysis for Polkadot',
      'Price movement patterns for Avalanche',
      'Polygon\'s market performance analysis',
      'Latest developments affecting BNB price',
      'Cardano\'s market outlook',
    ],
  },
  'https://deployment-sofftlsf9z4fya3qchykaanq.stag-vxzy.zettablock.com/main': {
    agent_id: 'deployment_SoFftlsf9z4fyA3QCHYkaANq',
    name: 'Transaction Analyzer',
    questions: [],
  },
};

class WalletSession {
  constructor(walletAddress, sessionId) {
    this.walletAddress = walletAddress;
    this.sessionId = sessionId;
    this.dailyPoints = 0;
    this.startTime = new Date();
    this.nextResetTime = new Date(this.startTime.getTime() + 24 * 60 * 60 * 1000);
    this.statistics = new
```