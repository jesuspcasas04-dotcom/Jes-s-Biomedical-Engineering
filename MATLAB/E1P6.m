% Cargar los datos
load('pract_emg.mat');

% Frecuencia de muestreo
Fs = 2000; % Hz

% Vector de tiempo
t_start = (0:length(EMG_Start)-1)/Fs;
t_end = (0:length(EMG_End)-1)/Fs;

% Asegurarse de que ambas señales tienen el mismo número de muestras
N = min(length(EMG_Start), length(EMG_End));
t = (0:N-1)/Fs;

% Figura 1: Señales solapadas
figure;
plot(t, EMG_Start(1:N), 'b', 'DisplayName', 'EMG sin fatiga'); hold on;
plot(t, EMG_End(1:N), 'r', 'DisplayName', 'EMG con fatiga');
xlabel('Tiempo (s)');
ylabel('Amplitud (mV)');
title('Comparación de señales EMG (solapadas)');
legend;
grid on;

% Figura 2: Dos subplots, una para cada señal
figure;

subplot(2,1,1);
plot(t, EMG_Start(1:N), 'b');
xlabel('Tiempo (s)');
ylabel('Amplitud (mV)');
title('EMG sin fatiga');
grid on;

subplot(2,1,2);
plot(t, EMG_End(1:N), 'r');
xlabel('Tiempo (s)');
ylabel('Amplitud (mV)');
title('EMG con fatiga');
grid on;

