% Ejercicio 2 - Comparación con ventana de Hamming (sin toolbox)

N = 256;
n = 0:N-1;

% Señal original
r = 6 * sin(2*pi*n/12);

% Crear ventana de Hamming manualmente
w_hamming = 0.54 - 0.46 * cos(2*pi*n/(N-1));

% Aplicar la ventana
rw = r .* w_hamming;

% Calcular espectros
R = fftshift(fft(r)) / N;
Rw = fftshift(fft(rw)) / N;
w = linspace(-pi, pi, N);

% ----------- Representación en el tiempo -----------
figure;
subplot(2,1,1); plot(n, r); title('Señal original r[n]');
xlabel('n'); ylabel('Amplitud');

subplot(2,1,2); plot(n, rw); title('Señal enventanada rw[n] (Hamming)');
xlabel('n'); ylabel('Amplitud');

% ----------- Representación en frecuencia -----------
figure;
subplot(2,1,1); stem(w, abs(R)); title('Espectro de r[n]');
xlabel('\omega [rad/muestra]'); ylabel('|R(\omega)|');

subplot(2,1,2); stem(w, abs(Rw)); title('Espectro de rw[n]');
xlabel('\omega [rad/muestra]'); ylabel('|Rw(\omega)|');
