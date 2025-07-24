const mainRepoOwner = "michael-harhay-arx";
const mainRepoName  = "TestParentRepo";

const p = context.payload;
const branch = p.ref.replace('refs/heads/', '');
const commitUrl = `${p.repository.html_url}/commit/${p.after}`;
const commitMsg = p.head_commit && p.head_commit.message ? p.head_commit.message : "";
const submoduleName = p.repository.name;
const issueTitle = `[${submoduleName}] Updates on ${branch}`;

const bodyUpdate = `
                    **Repository:** [${p.repository.full_name}](${p.repository.html_url})
                    **Pusher:** ${p.pusher.name}
                    **Branch:** ${branch}
                    **Commit:** [${p.after.substring(0,7)}](${commitUrl})

                    ${commitMsg ? "Message: " + commitMsg : ""}
                    `.trim();

// Check if an open issue with this title already exists
const existingIssues = await github.paginate(
  github.rest.issues.listForRepo,
  {
    owner: mainRepoOwner,
    repo: mainRepoName,
    state: "open",
    labels: "submodule-update"  // Optional label filter
  }
);

let issue = existingIssues.find(i => i.title === issueTitle);

// If issue already exists, update it (add a comment)
if (issue) {
  
  await github.rest.issues.update({
    owner: mainRepoOwner,
    repo: mainRepoName,
    issue_number: issue.number,
    body: bodyUpdate
  });
} 

// If no existing issue, create a new issue
else {
  await github.rest.issues.create({
    owner: mainRepoOwner,
    repo: mainRepoName,
    title: issueTitle,
    body: `**Push detected:**\n${bodyUpdate}`,
    labels: ["submodule-update"]  // Optional label
  });
}