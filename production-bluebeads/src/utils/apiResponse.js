class ApiResponse {
    constructor(
        statuscode,
        message="success",
        data
    )
    {
        this.message=message,
        this.data=data,
        this.statuscode=statuscode,
        this.success=statuscode<400
    }
}
export {ApiResponse}