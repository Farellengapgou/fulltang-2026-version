from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, permissions

from accounting.stock_models import (
    StockMovement,
    GoodsReceiptNote,
    GoodsIssueNote,
    Inventory,
    TransferNote,
)
from accounting.stock_serializers import (
    StockMovementSerializer,
    GoodsReceiptNoteSerializer,
    GoodsIssueNoteSerializer,
    InventorySerializer,
    TransferNoteSerializer,
)

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["material-accounting"]


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class StockMovementViewSet(ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="by-article")
    def by_article(self, request):
        article_id = request.query_params.get("article_id")
        qs = self.filter_queryset(self.get_queryset())
        if article_id:
            qs = qs.filter(article_id=article_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by-warehouse")
    def by_warehouse(self, request):
        warehouse_id = request.query_params.get("warehouse_id")
        qs = self.filter_queryset(self.get_queryset())
        if warehouse_id:
            qs = qs.filter(warehouse_id=warehouse_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "cancel"):
                instance.cancel(request.user if request.user else None)
                return Response({"detail": "Cancelled"}, status=status.HTTP_200_OK)
            return Response({"detail": "Cancel not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les notes de réception",
        operation_description="Retourne une liste paginée des notes de réception.",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class GoodsReceiptNoteViewSet(ModelViewSet):
    queryset = GoodsReceiptNote.objects.all()
    serializer_class = GoodsReceiptNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        instance = self.get_object()
        lines = getattr(instance, "lines", None)
        if lines is None:
            lines = instance.goodsreceiptline_set.all()
        try:
            serializer = instance.__class__.lines.field.child.__class__(lines, many=True)
            return Response(serializer.data)
        except Exception:
            from accounting.stock_serializers import GoodsReceiptLineSerializer

            serializer = GoodsReceiptLineSerializer(lines, many=True)
            return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "confirm"):
                instance.confirm(request.user if request.user else None)
                return Response({"detail": "Validated"}, status=status.HTTP_200_OK)
            return Response({"detail": "Validate not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "cancel"):
                instance.cancel(request.user if request.user else None)
                return Response({"detail": "Cancelled"}, status=status.HTTP_200_OK)
            return Response({"detail": "Cancel not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les notes de sortie",
        operation_description="Retourne une liste paginée des notes de sortie.",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class GoodsIssueNoteViewSet(ModelViewSet):
    queryset = GoodsIssueNote.objects.all()
    serializer_class = GoodsIssueNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        instance = self.get_object()
        lines = getattr(instance, "lines", None) or instance.goodsissueline_set.all()
        from accounting.stock_serializers import GoodsIssueLineSerializer

        serializer = GoodsIssueLineSerializer(lines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "confirm"):
                instance.confirm(request.user if request.user else None)
                return Response({"detail": "Validated"}, status=status.HTTP_200_OK)
            return Response({"detail": "Validate not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "cancel"):
                instance.cancel(request.user if request.user else None)
                return Response({"detail": "Cancelled"}, status=status.HTTP_200_OK)
            return Response({"detail": "Cancel not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les inventaires",
        operation_description="Retourne une liste paginée des inventaires.",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class InventoryViewSet(ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"], url_path="initialize")
    def initialize(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "initialize"):
                instance.initialize()
                return Response({"detail": "Initialized"}, status=status.HTTP_200_OK)
            return Response({"detail": "Initialize not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="start-counting")
    def start_counting(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "start_counting"):
                instance.start_counting()
                return Response({"detail": "Counting started"}, status=status.HTTP_200_OK)
            return Response({"detail": "Start counting not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "validate"):
                instance.validate(request.user if request.user else None)
                return Response({"detail": "Validated"}, status=status.HTTP_200_OK)
            return Response({"detail": "Validate not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "cancel"):
                instance.cancel(request.user if request.user else None)
                return Response({"detail": "Cancelled"}, status=status.HTTP_200_OK)
            return Response({"detail": "Cancel not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les transferts",
        operation_description="Retourne une liste paginée des transferts.",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class TransferNoteViewSet(ModelViewSet):
    queryset = TransferNote.objects.all()
    serializer_class = TransferNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        instance = self.get_object()
        lines = getattr(instance, "lines", None) or instance.transferline_set.all()
        from accounting.stock_serializers import TransferLineSerializer

        serializer = TransferLineSerializer(lines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "send"):
                instance.send(request.user if request.user else None)
                return Response({"detail": "Sent"}, status=status.HTTP_200_OK)
            return Response({"detail": "Send not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="receive")
    def receive(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "receive"):
                instance.receive(request.user if request.user else None)
                return Response({"detail": "Received"}, status=status.HTTP_200_OK)
            return Response({"detail": "Receive not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        instance = self.get_object()
        try:
            if hasattr(instance, "cancel"):
                instance.cancel(request.user if request.user else None)
                return Response({"detail": "Cancelled"}, status=status.HTTP_200_OK)
            return Response({"detail": "Cancel not implemented"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
