import * as core from '@actions/core'
import {exec, ExecOptions} from '@actions/exec'

export async function getChangesIntroducedByTag(tag: string): Promise<string> {
  const previousVersionTag = await getPreviousVersionTag(tag)

  return previousVersionTag
    ? getCommitMessageBetween(previousVersionTag, tag)
    : getCommitMessageFrom(tag)
}

export async function getPreviousVersionTag(
  tag: string
): Promise<string | null> {
  let previousTag = ''

  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        previousTag += data.toString()
      }
    },
    silent: true,
    ignoreReturnCode: true
  }

  const exitCode = await exec(
    'git',
    [
      'describe',
      '--match',
      'v[0-9]*',
      '--abbrev=0',
      '--first-parent',
      `${tag}^`
    ],
    options
  )

  core.debug(`The previous version tag is ${previousTag}`)

  return exitCode === 0 ? previousTag.trim() : null
}

export async function getCommitMessageBetween(
  firstTag: string,
  secondTag: string
): Promise<string> {
  let commitMessages = ''

  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        commitMessages += data.toString()
      }
    },
    silent: true
  }

  await exec(
    'git',
    ['log', '--format=%s', `${firstTag}..${secondTag}`],
    options
  )

  core.debug(`The commit messages between ${firstTag} and ${secondTag}`)

  return commitMessages.trim()
}

export async function getCommitMessageFrom(tag: string): Promise<string> {
  let commitMessages = ''

  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        commitMessages += data.toString()
      }
    },
    silent: true
  }

  await exec('git', ['log', '--format=%s', tag], options)

  core.debug(`The commit messages from ${tag} are:\n${commitMessages}`)

  return commitMessages.trim()
}
