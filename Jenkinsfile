  pipeline {
      agent any

      environment {
          REGISTRY = 'hb.inilahtv.com'
          IMAGE    = 'hb.inilahtv.com/inilah/scroll-animation'
          TAG      = "${env.BUILD_NUMBER}"
      }

      options {
          timestamps()
          timeout(time: 30, unit: 'MINUTES')
          buildDiscarder(logRotator(numToKeepStr: '20'))
      }

      stages {

          stage('Bangun image') {
              steps {
                  sh 'docker build -t ${IMAGE}:${TAG} .'
              }
          }

          stage('Uji aplikasi hidup') {
              steps {
                  sh '''
                      docker rm -f uji-${BUILD_NUMBER} >/dev/null 2>&1 || true
                      docker run -d --name uji-${BUILD_NUMBER} ${IMAGE}:${TAG}

                      for i in $(seq 1 30); do
                          if docker exec uji-${BUILD_NUMBER} wget -q -O /dev/null http://127.0.0.1:4000/ 2>/dev/null; then
                              echo "Aplikasi menjawab pada percobaan ke-$i"
                              exit 0
                          fi
                          sleep 2
                      done

                      echo "Aplikasi tidak menjawab dalam 60 detik. Log terakhir:"
                      docker logs --tail 50 uji-${BUILD_NUMBER}
                      exit 1
                  '''
              }
              post {
                  always {
                      sh 'docker rm -f uji-${BUILD_NUMBER} >/dev/null 2>&1 || true'
                  }
              }
          }

          stage('Dorong ke Harbor') {
              steps {
                  withCredentials([usernamePassword(credentialsId: 'robothb',
                                                    usernameVariable: 'HU',
                                                    passwordVariable: 'HP')]) {
                      sh '''
                          echo "$HP" | docker login ${REGISTRY} -u "$HU" --password-stdin
                          docker tag  ${IMAGE}:${TAG} ${IMAGE}:latest
                          docker push ${IMAGE}:${TAG}
                          docker push ${IMAGE}:latest
                      '''
                  }
              }
          }
      }

      post {
          always {
              sh '''
                  docker logout ${REGISTRY} >/dev/null 2>&1 || true
                  docker rmi ${IMAGE}:${TAG} ${IMAGE}:latest >/dev/null 2>&1 || true
              '''
          }
      }
  }

