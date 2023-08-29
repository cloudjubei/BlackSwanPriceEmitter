import fs from 'fs'

export const checkIfFileOrDirectoryExists = (path: string) : boolean =>
{
    return fs.existsSync(path)
}

export const getFileAsync = async (path: string) : Promise<string> =>
{
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err)
                return
            }
            resolve(data.toString())
        })
      })
}
export const getFile = (path: string) : string =>
{
    return fs.readFileSync(path).toString()
}

export const createOrWriteToFile = async (path: string, fileName: string, data: string) : Promise<void> =>
{
    if (!checkIfFileOrDirectoryExists(path)) {
        fs.mkdirSync(path)
    }

    fs.writeFileSync(`${path}/${fileName}`, data, 'utf8')
}

export const deleteFile = async (path: string) : Promise<void> =>
{
    fs.unlinkSync(path)
}