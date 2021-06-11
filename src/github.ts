import * as core from '@actions/core'
import * as github from '@actions/github'
import * as version from './version'
import * as markdown from './markdown'

export async function createReleaseDraft(
  repoToken: string,
  versionTag: string,
  changeLog: string
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const octokit = new github.GitHub(repoToken)

  const response = await octokit.repos.createRelease({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    tag_name: versionTag,
    name: version.removePrefix(versionTag),
    body: markdown.toUnorderedList(changeLog),
    prerelease: version.isPrerelease(versionTag),
    draft: true
  })

  if (response.status !== 201) {
    throw new Error(`Failed to create the release: ${response.status}`)
  }

  core.info(`Created release draft ${response.data.name}`)

  return response.data.html_url
}
