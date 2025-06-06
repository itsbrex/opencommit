#!/usr/bin/env node

import { cli } from 'cleye';

import packageJSON from '../package.json';
import { commit } from './commands/commit';
import { commitlintConfigCommand } from './commands/commitlint';
import { configCommand } from './commands/config';
import { hookCommand, isHookCalled } from './commands/githook.js';
import { prepareCommitMessageHook } from './commands/prepare-commit-msg-hook';
import { checkIsLatestVersion } from './utils/checkIsLatestVersion';
import { runMigrations } from './migrations/_run.js';

const extraArgs = process.argv.slice(2);

cli(
  {
    version: packageJSON.version,
    name: 'opencommit',
    commands: [configCommand, hookCommand, commitlintConfigCommand],
    flags: {
      fgm: {
        type: Boolean,
        description: 'Use full GitMoji specification',
        default: false
      },
      context: {
        type: String,
        alias: 'c',
        description: 'Additional user input context for the commit message',
        default: ''
      },
      yes: {
        type: Boolean,
        alias: 'y',
        description: 'Skip commit confirmation prompt',
        default: false
      }
    },
    ignoreArgv: (type) => type === 'unknown-flag' || type === 'argument',
    help: { description: packageJSON.description }
  },
  async ({ flags }) => {
    await runMigrations();
    await checkIsLatestVersion();

    if (await isHookCalled()) {
      prepareCommitMessageHook();
    } else {
      commit(extraArgs, flags.context, false, flags.fgm, flags.yes);
    }
  },
  extraArgs
);
