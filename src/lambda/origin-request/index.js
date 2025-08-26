exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const uri = request.uri;

    // Rewrite any extensionless path (at any depth) to ".html".
    // Examples:
    //   /path           -> /path.html
    //   /path/          -> /path.html
    //   /articles/foo   -> /articles/foo.html
    //   /articles/foo/  -> /articles/foo.html
    // Do not rewrite root or files with extensions.
    const normalized = uri.replace(/\/+$/, "");
    if (normalized === "") {
        return request;
    }
    const lastSegment = normalized.substring(normalized.lastIndexOf("/") + 1);
    if (lastSegment && !lastSegment.includes(".")) {
        request.uri = `${normalized}.html`;
    }
    return request;
};


