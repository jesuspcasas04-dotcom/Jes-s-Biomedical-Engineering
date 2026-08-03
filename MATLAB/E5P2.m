N = 5000; x_uniform = rand(1,N); x_gaussian=randn(1,N);

figure(2);

subplot(2,1,1);
histogram(x_uniform, 'BinWidth', 0.05, 'Normalization', 'count');
title('Histograma de señal uniforme');

subplot(2,1,2);
histogram(x_gaussian, 'BinWidth', 0.05, 'Normalization', 'count');
title('Histograma de señal gaussiana');


figure(3);
histogram(x_gaussian, 'BinWidth', 0.05, 'Normalization', 'probability');
title('Histograma de señal gaussiana con Normalización en Probabilidad');



% Parte 2: Señal sinusoidal con ruido gaussiano
fs = 100; 
t = 0:2*fs-1; 
x_sin = sin(2 * pi * t / fs); 

% Ruido gaussiano con media 0 y desviación estándar 0.5
ruido = 0.5 * randn(size(t));

% Señal con ruido
x_ruido = x_sin + ruido;

% Graficar la señal original y la señal con ruido
figure(4);
plot(t, x_sin, 'b', 'LineWidth', 1.5); hold on;
plot(t, x_ruido, 'r', 'LineWidth', 1.2);
legend('Señal sinusoidal', 'Señal con ruido gaussiano');
xlabel('Muestras');
ylabel('Amplitud');
title('Señal sinusoidal con ruido gaussiano');
grid on;

