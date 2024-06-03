pipeline {
    agent any
    
    triggers {
        githubPush()
    }

     stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // stage('Build and Push Docker Image') {
        //     environment {
        //         DOCKER_IMAGE = "faris94/web:${BUILD_NUMBER}" 
        //         DOCKERFILE_LOCATION = "./Dockerfile"
        //         REGISTRY_CREDENTIALS = credentials('docker-cred')
        //     }
        //     steps {
        //         script {
        //             sh 'docker build -t ${DOCKER_IMAGE} .'
        //             def dockerImage = docker.image("${DOCKER_IMAGE}")
        //             docker.withRegistry('https://index.docker.io/v1/', "docker-cred") {
        //                 dockerImage.push()
        //             }
        //         }
        //     }
        // }

        
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
                    sed -i "s/${OLD_BUILD_NUMBER}/${BUILD_NUMBER}/g" k8s/deployment.yml
                    git add k8s/deployment.yml
                    git commit -m "Update deployment image to version ${BUILD_NUMBER}"
                    git push git@github.com:${GIT_USER_NAME}/${GIT_REPO_NAME}.git HEAD:main
                '''
            }
        }
    }
}


     }
}