
fs=5000;
t=0:1/fs:5;
x=0.5*cos(2*pi*1000*t);
figure();
plot(t(1:500),x(1:500),'b'); xlabel('Tiempo'); ylabel('Señal x[n]'); title('Representación de x[n] en función del tiempo');




