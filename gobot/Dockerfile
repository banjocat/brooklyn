FROM ubuntu

RUN apt-get update && apt-get install -y ca-certificates
RUN mkdir -p /app
WORKDIR /app
COPY ./config.json .
COPY ./gobot .
RUN chmod 777 gobot
CMD ["/app/gobot"]
