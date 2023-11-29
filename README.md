# Update File in Repository with EJS

This GitHub Action allows you to update a file in your repository using an EJS template. 

The action is designed to replace content in a specified file between designated start and end comments with the rendered output of an EJS template. It requires five inputs, including the file path, starting comment, ending comment, EJS template path, and the JSON input for the template.

## Inputs

#### `FILE_PATH` (required)

The relative path of the file in the repository that you want to update.

#### `STARTING_COMMENT` (required)

The starting comment in the file, marking the beginning of the content to be replaced.

#### `ENDING_COMMENT` (required)

The ending comment in the file, marking the end of the content to be replaced.

#### `EJS_TEMPLATE_PATH` (required)

The relative path of the EJS template file that will be used for rendering content.

#### `TEMPLATE_INPUT_JSON` (required)

The JSON input that the EJS template will use for variable extraction. Ideally, this should be obtained from another action step.

## Usage

<!-- start usage -->
```yaml
- uses: actions/checkout@v4
  with:
    # The relative path of the file in the repository that you want to update.
    FILE_PATH: ''

    # The starting comment in the file mentioned in FILE_PATH, marking the beginning of the content to be replaced.
    # This usually depends on which file you are trying to update. 
    # e.g. for html/markdown file you can use '<!-- YOUR_STARTING_COMMENT -->'
    # e.g. for js file you can use '// YOUR_STARTING_COMMENT'
    STARTING_COMMENT: ''

    # The ending comment in the file mentioned in FILE_PATH, marking the end of the content to be replaced.
    # This usually depends on which file you are trying to update. 
    # e.g. for html/markdown file you can use '<!-- YOUR_ENDING_COMMENT -->'
    # e.g. for js file you can use '// YOUR_ENDING_COMMENT'
    ENDING_COMMENT: ''

    # The relative path of the EJS template file that will be used for rendering content.
    # [Learn more about EJS templates](https://ejs.co/#docs)
    EJS_TEMPLATE_PATH: ''

    # The JSON input that the EJS template will use for variable extraction. 
    # Ideally, this should be obtained from another action step.
    TEMPLATE_INPUT_JSON: ''

```
<!-- end usage -->

## Example Usage

```yaml
jobs:
  update_file:
    runs-on: ubuntu-latest
    name: Update File

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v2

    - name: Get Latest Hashnode Posts
      id: readme_content
      uses: anupammajhi/githubaction-latest-hashnode-posts@v1.0.0
      with:
        HASHNODE_PUBLICATION_ID: ${{ secrets.HASHNODE_PUB_ID }}

    # EXAMPLE USAGE OF THE ACTION starts here =====================

    - name: Update File
      id: update_file
      uses: anupammajhi/githubaction-update-repo-file@v1.0.1
      with:
        FILE_PATH: "README.md"
        STARTING_COMMENT: "<!-- CONTENT_AUTO_START -->"
        ENDING_COMMENT: "<!-- CONTENT_AUTO_END -->"
        EJS_TEMPLATE_PATH: "readmeTemplate.ejs"
        TEMPLATE_INPUT_JSON: ${{ steps.readme_content.outputs.result }}

```

## Scenario
1. To update a static website with content from other sources on a regular basis
    
    Example:
    
    It is used at a static portfolio [github.com/anupammajhi/anupammajhi.github.io](https://github.com/anupammajhi/anupammajhi.github.io) to update blog page on a daily schedule.

    [See the Action Workflow](https://github.com/anupammajhi/anupammajhi.github.io/blob/master/.github/workflows/update_blog.yml)
