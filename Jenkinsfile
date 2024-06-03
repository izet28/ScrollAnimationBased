// pipeline {
//     agent any
    
//     triggers {
//         githubPush()
//     }

//      stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Build and Push Docker Image') {
//             environment {
//                 DOCKER_IMAGE = "faris94/web:${BUILD_NUMBER}" 
//                 DOCKERFILE_LOCATION = "./Dockerfile"
//                 REGISTRY_CREDENTIALS = credentials('docker-cred')
//             }
//             steps {
//                 script {
//                     sh 'docker build -t ${DOCKER_IMAGE} .'
//                     def dockerImage = docker.image("${DOCKER_IMAGE}")
//                     docker.withRegistry('https://index.docker.io/v1/', "docker-cred") {
//                         dockerImage.push()
//                     }
//                 }
//             }
//         }
//      }
// }