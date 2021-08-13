# `interface ITyntecWhatsAppAdapterSettings`

`ITyntecWhatsAppAdapterSettings` contains settings used to initialize [`TyntecWhatsAppAdapter`](./TyntecWhatsAppAdapter.md)
instances.

Properties:
* [`axiosInstance: AxiosInstance`](#axiosinstance-axiosinstance)
* [`maxBodySize?: number`](#maxbodysize-number)
* [`tyntecApikey: string`](#tyntecapikey-string)


## `axiosInstance: AxiosInstance`

Is an [Axios instance](https://github.com/axios/axios) used to send requests to
the tyntec Conversations API.


## `maxBodySize?: number`

Is the maximum size of the request body accepted in `processActivity`.


## `tyntecApikey: string`

Is a [tyntec API key](https://www.tyntec.com/docs/faq-whatsapp-business-onboarding-how-can-i-get-api-key-setup-my-whatsapp-business-account)
used to authenticate requests to the tyntec Conversations API.
