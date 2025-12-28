export async function alterContentBody(contentBody: string, contentToReplaceWith: string) {
    try {
        // console.log(contentBody, contentToReplaceWith)
        let alterText = contentBody.replace('{{OTP}}', contentToReplaceWith)
        // console.log(alterText)
        return alterText

    } catch (error) {
        console.error('Error Altering Contnet:', error)
    }
}