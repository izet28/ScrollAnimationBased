pipeline {
    agent any
    
    triggers {
        githubPush()
    }

     stages {
        stage('Checkout') {
            steps {
                sh 'pwd'
                sh 'echo passed!!!!'
                git branch: 'main', url: 'https://github.com/izet28/ScrollAnimationBased.git'
                sh 'pwd'
                sh 'ls'
            }
        }

        stage('Build and Push Docker Image') {
            environment {
                DOCKER_IMAGE = "faris94/web:${BUILD_NUMBER}" 
                DOCKERFILE_LOCATION = "./Dockerfile"
                REGISTRY_CREDENTIALS = credentials('docker-cred')
            }
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE} .'
                    def dockerImage = docker.image("${DOCKER_IMAGE}")
                    docker.withRegistry('https://index.docker.io/v1/', "docker-cred") {
                        dockerImage.push()
                    }
                }
            }
        }

         stage('Trivy Image Scan') {
            environment {
                TRIVY_VERSION = "v0.18.3"
                TRIVY_PATH = "${env.WORKSPACE}/trivy"
                IMAGE = "faris94/web:${BUILD_NUMBER}" 
    }
             steps {
                sh '''
                    mkdir -p ${TRIVY_PATH}
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b ${TRIVY_PATH} ${TRIVY_VERSION}
                '''
                script {
                    env.PATH = "${TRIVY_PATH}:${env.PATH}"
                     withEnv(['TRIVY_INSECURE=true']) {
                        sh '''
                            unset GITHUB_TOKEN
                            trivy image --ignore-unfixed --vuln-type os,library --exit-code 1 --severity CRITICAL $IMAGE
                        '''
                }
            }
    }
         }

        
        stage('Update Deployment File') {
    environment {
        GIT_REPO_NAME = "ScrollAnimationBased"
        GIT_USER_NAME = "izet28"
    }
    steps {
        script {
            sshagent(['izet28']) {
                sh '''
                    git config user.email "zetcoin29@gmail.com" 
                    git config user.name "izet28"            
                    OLD_BUILD_NUMBER=$((${BUILD_NUMBER}-1))
                    sed -i "s/${OLD_BUILD_NUMBER}/${BUILD_NUMBER}/g" k8s/app.yaml
                    git add k8s/app.yaml
                    git commit -m "Update deployment image to version ${BUILD_NUMBER}"
                    git push git@github.com:${GIT_USER_NAME}/${GIT_REPO_NAME}.git HEAD:main
                '''
            }
        }
    }
}


     }
}