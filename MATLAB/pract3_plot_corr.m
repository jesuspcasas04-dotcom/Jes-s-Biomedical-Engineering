% 
% CORRELACIÓN
% Se desea saber si una señal recibida coincide en algun momento con otra señal almacenada con anterioridad. La correlación 
% permite conocer esto incluso cuando los datos están contaminados con ruido. 
% Este ejemplo usa la grabación de una moneda girando encima de una mesa.
% La grabación completa dura 10 segundos. Se va a tomar una parte de la
% señal de duración 1 segundo para correlarla con la señal completa.
%

% Carga el registro y la frecuencia de muestreo. 
% Variables: 
%       y => Señal
%       Fs => Frecuencia de muestreo. Su inversa (1/Fs) es el tiempo entre
%       muestras (periodo de muestreo)
load('Moneda.mat') 

% Pasa la señal de audio a formato 'double'
Senyal_completa = double(y);

% Para escuchar el registro completo
soundsc(Senyal_completa,Fs)

% Eje de tiempos
Tiempo = 0:1/Fs:(length(Senyal_completa)-1)/Fs; 

% Valores mínimo y máximo de la señal
m = min(Senyal_completa);
M = max(Senyal_completa);


% Se queda con la parte entre los segundos 7 y 8
TiempoA = 7;
TiempoB = 8;
Intervalo = TiempoA*Fs:TiempoB*Fs;

Fragmento = Senyal_completa(Intervalo);

% Para escuchar el fragmento extraído
soundsc(Fragmento,Fs)


% Dibuja la señal completa y el fragmento. Se indican los límites para visualización.
figure(1);
plot(Tiempo,Senyal_completa,[TiempoA TiempoB;TiempoA TiempoB],[m m;M M],'r--')
xlabel('Tiempo (s)')
ylabel('Señal')
axis tight

figure(2);
plot(Intervalo/Fs,Fragmento)
xlabel('Tiempo (s)')
ylabel('Señal')
title('Fragmento de 1 segundo')
axis tight


% Calcula y dibuja la correlación de la señal completa y el fragmento considerado.
[xCorr,lags] = xcorr(Senyal_completa,Fragmento);

figure(3);
plot(lags/Fs,xCorr)
grid
xlabel('Desplazamiento (s)')
ylabel('Correlación')
axis tight

% El desplazamiento para el cual la correlación es máxima es el retardo temporal entre los instantes de inicio de ambas señales. En este caso, 7 segundos. 
% Dibuja la señal con el fragment superpuesto. Se calcula su posición
% mirando el máximo de la correlación.
[~,Indice] = max(abs(xCorr));
maxt = lags(Indice);

Fragmento_dibuja = NaN(size(Senyal_completa));
Fragmento_dibuja(maxt+1:maxt+length(Fragmento)) = Fragmento;

figure(4);
plot(Tiempo,Senyal_completa,Tiempo,Fragmento_dibuja)
xlabel('Tiempo (s)')
ylabel('Señal')
axis tight

%%                                      SE AÑADE RUIDO QUE ENMASCARA LA SEÑAL
%
% Se repite todo el procedimiento pero se añade ruido gaussiano tanto a la señal completa como al fragmento extraído.
Factor = 3;
NoiseAmp = Factor*0.2*max(abs(Fragmento));

Fragmento = Fragmento+NoiseAmp*randn(size(Fragmento));

Senyal_completa = Senyal_completa+NoiseAmp*randn(size(Senyal_completa));

% % En el sonido se aprecia el enmascaramiento del ruido sobre la señal original.
% Para escuchar el fragmento de señal contaminado con ruido
soundsc(Fragmento,Fs)

% A partir de aquí se repite todo el proceso anterior relizado sin ruido
figure(5);
plot(Tiempo,Senyal_completa,[TiempoA TiempoB;TiempoA TiempoB],[m m;M M],'r--')
xlabel('Tiempo (s)')
ylabel('Señal con ruido')
axis tight

% Correlación con ruido
[xCorr,lags] = xcorr(Senyal_completa,Fragmento);

figure(6);
plot(lags/Fs,xCorr)
grid
xlabel('Retardo (s)')
ylabel('Señal con ruido')
axis tight

% El desplazamiento para el cual la correlación es máxima es el retardo temporal entre los instantes de inicio de ambas señales. En este caso, 7 segundos. 
% Dibuja la señal con el fragment superpuesto. Se calcula su posición
% mirando el máximo de la correlación.
[~,Indice] = max(abs(xCorr));
maxt = lags(Indice);

Fragmento_dibuja = NaN(size(Senyal_completa));
Fragmento_dibuja(maxt+1:maxt+length(Fragmento)) = Fragmento;

figure(7);
plot(Tiempo,Senyal_completa,Tiempo,Fragmento_dibuja)
xlabel('Tiempo (s)')
ylabel('Señal con ruido')
axis tight