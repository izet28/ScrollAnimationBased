pipeline {
    agent any

    environment {
        REGISTRY = 'hb.inilahtv.com'
        IMAGE    = 'hb.inilahtv.com/inilah/scroll-animation'
        TAG      = "${env.BUILD_NUMBER}"

        VM   = '12.105.0.1'      // <-- ISI: IP atau nama host VM tujuan
        PORT = '4000'                  // <-- ISI: port yang dibuka di VM tujuan
        APP  = 'scroll-animation'      // nama container di VM tujuan
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        // Deploy tidak boleh berjalan berbarengan - dua build sekaligus akan
        // saling menimpa container di VM tujuan.
        disableConcurrentBuilds()
    }

    stages {

        stage('Bangun image') {
            steps {
                sh 'docker build -t ${IMAGE}:${TAG} .'
            }
        }

        stage('Uji aplikasi hidup') {
            // Diuji DARI DALAM container. Jenkins berjalan di dalam container
            // juga, jadi port yang diterbitkan `docker run -p` mendarat di HOST -
            // dan curl 127.0.0.1 dari Jenkins tidak akan menemukannya meski
            // aplikasinya sehat. Cara ini menghindari jebakan itu.
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
                withCredentials([usernamePassword(credentialsId: 'harbor-robot',
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

        stage('Deploy ke VM') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'vm-deploy',
                                      keyFileVariable: 'KUNCI',
                                      usernameVariable: 'SSHUSER'),
                    usernamePassword(credentialsId: 'robothb',
                                     usernameVariable: 'RU',
                                     passwordVariable: 'RP')
                ]) {
                    sh '''
                        set -eu
                        kirim() {
                            ssh -i "$KUNCI" -o StrictHostKeyChecking=accept-new \
                                -o ConnectTimeout=10 "$SSHUSER@$VM" "$@"
                        }

                        SEBELUM=$(kirim "docker inspect -f '{{.Config.Image}}' $APP 2>/dev/null || true")
                        echo "versi sebelumnya di $VM: ${SEBELUM:-(belum ada, ini deploy pertama)}"

                        # Heredoc TANPA petik: $RP disisipkan di sini, jadi rahasianya
                        # mengalir lewat stdin dan tidak pernah muncul di `ps` milik VM.
                        kirim 'bash -s' <<EOF
set -eu
echo '$RP' | docker login '$REGISTRY' -u '$RU' --password-stdin

# dockerd MILIK VM TUJUAN yang menarik, langsung dari Harbor -
# bukan mesin Jenkins. Image tidak pernah lewat Jenkins dua kali.
docker pull '$IMAGE:$TAG'

docker rm -f '$APP' >/dev/null 2>&1 || true
docker run -d --name '$APP' --restart unless-stopped -p $PORT:3000 '$IMAGE:$TAG'

docker logout '$REGISTRY' >/dev/null 2>&1 || true
echo "container $APP jalan di $VM dari $IMAGE:$TAG"
EOF
                    '''
                }
            }
        }

        stage('Health check di VM') {
            // Dicek DARI DALAM VM. Port $PORT itu milik VM tujuan, tidak
            // terlihat dari mesin Jenkins.
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'vm-deploy',
                                                   keyFileVariable: 'KUNCI',
                                                   usernameVariable: 'SSHUSER')]) {
                    sh '''
                        set -eu
                        ssh -i "$KUNCI" -o StrictHostKeyChecking=accept-new \
                            -o ConnectTimeout=10 "$SSHUSER@$VM" \
                            "bash -s -- $APP $PORT" <<'CEK'
set -eu
APP="$1"; PORT="$2"

ambil() {
    if command -v curl >/dev/null 2>&1; then
        curl -sf -o /dev/null "$1"
    else
        wget -q -O /dev/null "$1"
    fi
}

echo "menunggu aplikasi siap di port $PORT..."
for i in $(seq 1 30); do
    if ambil "http://127.0.0.1:$PORT/"; then
        echo "sehat pada percobaan ke-$i"
        exit 0
    fi
    sleep 2
done

echo "tidak pernah menjawab dalam 60 detik. Log container:"
docker logs --tail 40 "$APP"
exit 1
CEK
                    '''
                }
            }
        }

        stage('Bersihkan image lama di VM') {
            // Sengaja SETELAH health check: tidak ada image lama yang disentuh
            // sebelum versi baru terbukti sehat. Kalau health check gagal,
            // tahap ini tidak pernah jalan dan image lama masih utuh untuk
            // dikembalikan secara manual.
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'vm-deploy',
                                                   keyFileVariable: 'KUNCI',
                                                   usernameVariable: 'SSHUSER')]) {
                    sh '''
                        set -eu
                        ssh -i "$KUNCI" -o StrictHostKeyChecking=accept-new \
                            -o ConnectTimeout=10 "$SSHUSER@$VM" \
                            "bash -s -- $IMAGE $TAG" <<'BERSIH'
set -eu
IMAGE="$1"; TAG="$2"

docker images "$IMAGE" --format '{{.Tag}}' \
  | grep -vx "$TAG" | grep -vx latest \
  | while read -r t; do
        echo "hapus $IMAGE:$t"
        docker rmi "$IMAGE:$t" >/dev/null 2>&1 || true
    done

echo "sisa image di VM:"
docker images "$IMAGE" --format '  {{.Repository}}:{{.Tag}}'
BERSIH
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
        failure {
            echo "Build gagal. Container lama di ${VM} TIDAK diubah kalau kegagalannya terjadi sebelum tahap Deploy."
        }
    }
}
