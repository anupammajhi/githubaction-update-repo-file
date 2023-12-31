const core = require('@actions/core');
const fs = require('fs')
const { exec } = require('child_process')
const path = require('path')
const ejs = require('ejs')

async function replaceSelectedText(fileOptions){
    const { filePath, startComment, endingComment } = fileOptions
    let existingFileContent
    
    try{
        existingFileContent = fs.readFileSync(filePath, 'utf-8')
    }
    catch(e){
        console.error(e)
    }

    checkTextExists(startComment, existingFileContent)
    checkTextExists(endingComment, existingFileContent)

    const updatedFileContent = fillContent(existingFileContent, fileOptions)

    try{
        fs.writeFileSync(filePath, updatedFileContent)
    }
    catch(e){
        console.error(e)
    }    

    commitOptions = {
        filePath: filePath, 
        commitMessage: `Update file ${path.basename(filePath)}`
    }

    // console.log(fs.readFileSync(filePath, 'utf-8')) // For running locally
    await commitFile(commitOptions) // For running in prod

}

function checkTextExists(text, fileContent){
    if(!fileContent.includes(text)){
        throw new Error(`Text "${text}" not found in file`)
    }
}

function fillContent(existingFileContent, fileOptions){
    const { textToFill, startComment, endingComment } = fileOptions

    const fillRegex = new RegExp(`${startComment}([\\s\\S]*?)${endingComment}`,'g')
    const newContent = existingFileContent.replaceAll(fillRegex, `${startComment}\n${textToFill}\n${endingComment}`)
    return newContent
}

async function commitFile(options){
    const { filePath, commitMessage } = options
    let changes

    try{
        changes = await runExec(`git diff -- "${filePath}"`)
    }
    catch(e){
        console.error(e)
        return
    }
    
    if(changes && changes.trim().length > 0){
        console.log(`Found changes in file ${filePath}`)
        await runExec(`git config --global 'user.name' 'Github Action Update File'`)
        await runExec(`git config --global 'user.email' 'action@github.com'`)
        await runExec(`git add ${filePath}`)
        await runExec(`git commit -m "${commitMessage}"`)
        await runExec(`git push`)
    }
    else{
        console.log(`No changes found in file ${filePath}`)
        return
    }
    
}

async function runExec(command){
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if(error){
                console.error(`Error: ${error}`)
                reject(error)
            }
            if(stderr){
                console.error(stderr)
            }

            console.log(`Command output: ${stdout}`)
            resolve(stdout)
        })
    })
}

async function main(){
    
    let ejsTemplate
    try {
        ejsTemplate =  fs.readFileSync(`${process.env.GITHUB_WORKSPACE}/${core.getInput('EJS_TEMPLATE_PATH')}`, 'utf-8')
    }
    catch(e) {
        console.error(e)
    }

    const jsonData = JSON.parse(core.getInput('TEMPLATE_INPUT_JSON'))
    const textToFill = ejs.render(ejsTemplate, { jsonData })

    const fileOptions = {
        filePath: `${process.env.GITHUB_WORKSPACE}/${core.getInput('FILE_PATH')}`,
        textToFill: textToFill,
        startComment: core.getInput('STARTING_COMMENT'),
        endingComment: core.getInput('ENDING_COMMENT')
    }
    
    await replaceSelectedText(fileOptions)
}

main()
