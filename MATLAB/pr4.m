% Practicando para la práctica 4.
% 1º Muestreo en el dominio temporal
%
%%%%%% Cuantificaci´on
%
% Realiza una cuantificaci´on seg´un una funci´on de cuantificaci´on
%
% x: secuencia original
% xq: se˜nal cuantificada
%
% Se˜nal
fa = 1000; % Frecuencia de la se˜nal anal´ogica
fs = 50000; % Frecuencia de muestreo
N = 100; % N´umero de muestras de la secuencia
n = 0:N;
x = ...... % Se˜nal ’seno’ discreta a implementar en el Ejercicio 1
% Margen din´amico de la se˜nal
md = max(x)-min(x);
% Nº bits
B = 3;
% Nº niveles de cuantificaci´on
L = 2^B;
% Margen din´amico del cuantificador IGUAL AL margen din´amico de la se˜nal
mdc = 1*md;
% Escal´on de cuantificaci´on (resoluci´on)
escalon = mdc / 2ˆB;
% Funci´on del cuantificador Q(x[n]) ==> A implementar en el Ejercicio 2
% ...
figure(3);
plot(x,'.-'); hold on; plot(xq,'*-r');
legend('Secuencia x[n]','Secuencia cuantificada xq[n]');grid
% Relaci´on se˜nal-ruido de cuantificaci´on te´orica
SQNR_dB_teo = 1.76 + 6.02*B
