# bug-viewer

The tool agregates results from different open source code scanners and display those results in a web interface. In a nutshell, it receives scanner results in JSON format and display them in a human readable format. Our implementation of some popular scanners can be found under the scanner folder but feel free to use your own implementation.

## Server Deployment
There are two out of the box deployment methods, docker-compose and kubernetes. 

Both methods come with a mongo container configuration, remove that configuration if you wish to use an existing mongo instance.

### Docker Compose
```
git clone https://github.com/leandro-lorenzini/bug-viewer.git && cd bug-viewer
# Update the environment variables under docker-compose.yml
docker-compose up -d
```
If you wish to run the project with SSL, make sure to place your certificate.crt and certificate.key under ./api/cert

### Kubernetes
```
git clone https://github.com/leandro-lorenzini/bug-viewer.git && cd bug-viewer/kubernetes
# Update the environment variables under deployment.yaml
kubectl apply -f .
```
### Environment Variables reference

|Variable           |Default Value                    |Required   |Description                                                      |
|-------------------|---------------------------------|----------|------------------------------------------------------------------|
|SESSION_SECRET |                                 |Yes       |A ramdom and complex value to be used by express-session          |
|ORIGIN         |                                 |Yes       |The server's fqdn or IP address, eg: https://bugviewer.domain.com |
|SSL            |false                            |No        |If the application should be served with HTTPS, without a proxy   |
|MONGO_URI      |mongodb://mongo:27017/bug-viewer |No        |Set this variable if you want to use a different mongodb server   |

### Server setup
The default admin user and password is ```admin@localhost/admin@localhost```, make sure to change it during the first login.

## Scanners
Although the main goal of this tool is to aggregate the results of any scanner, I've created some scripts that will run some common scanner tools such as eslint, bandit, gitleaks and etc...  I only tested the scanner using github and gitlab shared runners, but you should also be able to get it working in other environments, more information below.

### CI/CD Working example
- Github example [.github/workflows/default.yml](.github/workflows/default.yml)
- Girlab example  [.gitlab-ci.yml](.gitlab-ci.yml)

Both examples (github and gitlab) can be used to guide you on how to set up the scanners in your repository, but if you are not using CI/CD at all, using those files as they are should work for you, just remember to set the variables/secrets ```BUGVIEWER_SERVER``` and ```BUGVIEWER_TOKEN``` in your git repository settings.

### Implementing your own scanners
If you want to implement the scanners youselft, a sample of how scan results should be sent to the server can be found [here](scanner/submit.sh). The ```JSON parser``` is selected according to the uploaded file(s) name, make sure to include ```__ParserName__``` in the filename. Parsers can be viewd in https://<SERVER_NAME>/parser. You can use one of the existing parsers or create your own. ```JSON Parser``` is the congiguration that tells the tool how to map the results from the different scanners to the fields that you can see on the web interface.

```
curl --location 'https://SERVER_NAME/api/repository' \
--form 'name="RepositoryName"' \
--form 'ref="Branchref or Pull Request ref"' \
--form 'token="Token created using the UI or API"' \
--form 'files=@"./scanner/tmp/results/__ParserNeme#1__.json"' \
--form 'files=@"./scanner/tmp/results/__ParserNeme#2__.json"' \
--form 'removePaths="Path to remove #1"' \
--form 'removePaths="Path to remove #2"' \
--form 'modifiedFiles="Mofified file #1"' \
--form 'modifiedFiles="Modified file #2"' \
```

|Key                |Descriptiom                         |Required  |Type
|-------------------|------------------------------------|-----------|---------------------------------------------------------------|
|name               |The name of the project/repository  |Yes        |String      |
|ref                |The branch name or pull reuqest ref |Yes        |String      |
|token              |Token created using the UI/API      |Yes        |String      |
|files              |Scanner result files in JSON format |Yes        |File or Array of Files |
|removePaths        |Value to be erased on results file path field, tipically the path to your project folder |No (But probably needed)  |String or Array of Strings |
|modifiedFiles      |Files that have been modified during a pull request |No (Maybe necessary during pull requests) |String or Array of Strings |
