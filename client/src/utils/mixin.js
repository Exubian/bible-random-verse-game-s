
const apiUrl = ['production', 'staging'].includes(import.meta.env.MODE)
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV;

export const methods = {
  fetch(url, options = {}) {
    return {
      async request(method, data = null, requestOptions = {
        showError: true
      }) {
        return new Promise(async (resolve, reject) => {
          // start loader
          // const ui = useUI();
          // ui.ringLoader = true;

          // if (!localStorage.token && !['login', 'register', 'reset'].some(v => url.includes(v))) {
          //   console.log('no token');
          //   return reject(router.push('/login'));
          // }

          const headers = {
            // Authorization: localStorage.token,
          };

          if (typeof data === 'object' && data !== null && !(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json; charset=utf-8';
          }

          // Required to SLIM PHP Framework
          // if (method === 'POST' && !(data instanceof FormData)) {
          //   data = toFormData(data)
          // }

          try {
            let response = await fetch(apiUrl + url, {
              method,
              headers,
              body: data instanceof FormData ? data : data ? JSON.stringify(data) : null,
            });

            // ui.ringLoader = false;

            if (response.status !== 200) {
              if (response.status === 401) {
                // localStorage.clear();
                // router.push('/login');
              }

              const errorText = await response.text();

              let errorMessage;
              try {
                // Попытка разобрать как JSON
                const errorObj = JSON.parse(errorText);
                errorMessage = errorObj.message || JSON.stringify(errorObj);
              } catch {
                // Если JSON не распарсился, используем текст ошибки
                errorMessage = errorText;
              }

              // requestOptions.showError && useDialogs().openNotification({
              //   text: (options.errorPrefix || '') + errorMessage + (options.errorSuffix || ''),
              //   class: 'error',
              // });

              console.warn(errorMessage);
              throw { code: response.status, message: errorMessage };
            }

            // Обработка ответа, если он содержит файл
            if (
              response.headers.get('Content-Type')?.includes('application/zip') ||
              response.headers.get('Content-Type')?.includes('application/octet-stream') ||
              response.headers.get('Content-Type')?.includes('application/pdf') ||
              response.headers.get('Content-Type')?.includes('application/vnd')
            ) {
              const dispositionFilename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)
              const blob = await response.blob();

              // Создаем URL для загрузки файла
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = options.filename 
                || dispositionFilename?.[1]
                || 'file.zip'; // Название файла (можно сделать динамическим)
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);

              return resolve(blob);
            }

            return resolve(await response.json());
          } catch (err) {
            // ui.ringLoader = false;
            console.warn(err);
            // if (options.resendFailed) saveFailedRequest(url, method, data);
            return reject(err);
          }
        });
      },

      get(requestOptions) {
        return this.request('GET', null, requestOptions);
      },

      post(data = null, requestOptions) {
        return this.request('POST', data, requestOptions);
      },

      patch(data = null, requestOptions) {
        return this.request('PATCH', data, requestOptions);
      },

      put(data = null, requestOptions) {
        return this.request('PUT', data, requestOptions);
      },

      delete(data = null, requestOptions) {
        return this.request('DELETE', data, requestOptions);
      },

      // Новый метод для скачивания файла
      downloadFile(data = null) {
        return this.request('POST', data);
      },
    };
  },
}