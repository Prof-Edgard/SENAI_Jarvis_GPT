//console.log("Alô, mundo!");
//Vamos capturar a fala do usuário
let botao = document.querySelector("#microfone");
let input = document.querySelector('input');

const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
const AZURE_AI_KEY = process.env.AZURE_AI_KEY;

const capturarFala = () => {
   

    //Vamos criar um objeto de reconhecimento de fala
    const fala = new webkitSpeechRecognition();
    fala.lang = window.navigator.language;
    fala.continuous = true;
    fala.interimResults = true;


    botao.addEventListener('mousedown', () => {
        fala.start();
        console.log("Mouse apertado")
    });

    botao.addEventListener('mouseup', () => {
        fala.stop();
        console.log("Mouse solto");
        console.log(input.value);
        perguntarAoJarvis(input.value);

    });

    //Agora vamos capturar o resultado da fala
    fala.addEventListener('result', (e) => {
         const resultados = e.results[0][0].transcript;
         input.value = resultados;
         console.log(resultados);
    });
}

function falarComoJarvis(textoParaFala){
    const pontoDeExt = 'https://brazilsouth.tts.speech.microsoft.com/cognitiveservices/v1';
    const headers = {
        'Ocp-Apim-Subscription-Key': AZURE_AI_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'curl',
      };
      const body = `
      <speak version='1.0' xml:lang='pt-BR'>
          <voice xml:lang='pt-BR' xml:gender='Male' name='pt-BR-JulioNeural'>
              ${textoParaFala}
          </voice>
      </speak>
      `;
      fetch(pontoDeExt, {
        method: 'POST',
        headers,
        body,
      })
      .then((resposta) => {
        if(resposta.ok){
            return resposta.arrayBuffer();
        }else{
            throw new Error(`Falha na requisição: ${resposta.status} - ${resposta.statusText}`);
        }
      }).then( dados => {
        const blob = new Blob([dados], {type: 'audio/mpeg'});
        const URLaudio = URL.createObjectURL(blob);

        const elementoAudio = new Audio(URLaudio);
        elementoAudio.play();
      })
      .catch(erro => {
        console.error('Erro: ', erro);
      })

}

capturarFala();

const perguntarAoJarvis = async (pergunta) => {
    let url = "https://api.openai.com/v1/chat/completions";
    let header = {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${OPEN_AI_KEY}`
    }
    
    let body = {
        "model": "ft:gpt-3.5-turbo-0613:zeros-e-um::8DDHyrh4",
        "messages": [
          {
            "role": "system",
            "content": "Jarvis é um chatbot pontual e muito simpático que ajuda as pessoas"
          },
          {
            "role": "user",
            "content": pergunta
          }
        ],
        "temperature": 0.7
    }

    let options = {
        method: "POST",
        headers: header,
        body: JSON.stringify(body)
    }
    fetch(url, options)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data.choices[0].message.content);
        //falarComoJarvis(data.choices[0].message.content);
    })
}