% Efecto del muestreo
%
% Representación de forma aproximada de señales analógicas.

fsa = 1000; % La inversa de ’fsa’ es la separación temporal entre muestras.
T = 1; % Tiempo que dura la señal en segundos
f1 = 10; % Frecuencia de una señal sinusoidal (10 Hz)
f2 = 50; % Frecuencia otra señal sinusoidal (50 Hz)

% Vector del eje de tiempos para la señal continua
ta = [0:1/fsa:T-1/fsa]; 

% Señales analógicas (usando la ecuación 1: x(t) = A cos(2πf0t + φ))
x_analogica_1 = cos(2*pi*f1*ta); % Señal de 10 Hz
x_analogica_2 = cos(2*pi*f2*ta); % Señal de 50 Hz

% Gráficas de las señales analógicas
figure(1);
subplot(211);
plot(ta, x_analogica_1, 'b');
xlabel('Tiempo (s)');
title('Señal de frecuencia de 10 Hz');

subplot(212);
plot(ta, x_analogica_2, 'r');
xlabel('Tiempo (s)');
title('Señal de frecuencia de 50 Hz');

% Ahora se procede al muestreo. Se muestrea a 40 Hz.
fs = 40; % Frecuencia de muestreo (40 Hz)

% Vector para el índice de muestras (usando la ecuación 3: x[n] = A cos(2πf0n/fs + φ))
n = 0:length(ta)-1; % índice de muestras

% Señales muestreadas (usando la ecuación 3)
x_discreta_1 = cos(2*pi*f1*n/fs); % Señal de 10 Hz muestreada
x_discreta_2 = cos(2*pi*f2*n/fs); % Señal de 50 Hz muestreada

% Gráficas de las señales muestreadas
figure(2);
subplot(211);
stem(n, x_discreta_1, 'b');
axis([0 40 -1 1]); % Limitamos el eje x entre 0 y 40
xlabel('n (muestras)');
title('Señal de 10 Hz muestreada a 40 Hz');

subplot(212);
stem(n, x_discreta_2, 'r');
axis([0 40 -1 1]); % Limitamos el eje x entre 0 y 40
xlabel('n (muestras)');
title('Señal de 50 Hz muestreada a 40 Hz');
